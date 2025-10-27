import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import CryptoJS from "npm:crypto-js@4.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MERCHANT_CODE = Deno.env.get("TCO_MERCHANT_CODE") || "";
const BUY_LINK_SECRET = Deno.env.get("TCO_BUY_LINK_SECRET") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface GenerateInvoiceRequest {
  orderIds: string[];
  customerId: string;
  returnUrl: string;
  cancelUrl: string;
}

interface Product {
  name: string;
  price: number;
  quantity: number;
}

function generatePaymentLink(params: {
  invoiceId: string;
  products: Product[];
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}): string {
  const { invoiceId, products, currency, returnUrl, cancelUrl } = params;

  if (!MERCHANT_CODE || !BUY_LINK_SECRET) {
    throw new Error('2Checkout credentials not configured in Supabase Secrets');
  }

  if (!products || products.length === 0) {
    throw new Error('At least one product is required');
  }

  const baseParams: Record<string, string> = {
    merchant: MERCHANT_CODE,
    dynamic: '1',
    'return-url': returnUrl,
    'return-type': 'redirect',
    'cancel-url': cancelUrl,
    currency: currency,
    'merchant-order-id': invoiceId,
    tangible: '0',
    src: 'DYNAMIC',
  };

  products.forEach((product, index) => {
    const suffix = index === 0 ? '' : `_${index}`;
    baseParams[`prod${suffix}`] = product.name.trim();
    baseParams[`price${suffix}`] = product.price.toFixed(2);
    baseParams[`qty${suffix}`] = product.quantity.toString();
    baseParams[`type${suffix}`] = 'PRODUCT';
  });

  const paramsArray = Object.entries(baseParams).sort(([keyA], [keyB]) =>
    keyA.localeCompare(keyB)
  );

  const signatureString = paramsArray
    .map(([_, value]) => `${value.length}${value}`)
    .join('');

  const signature = CryptoJS.HmacSHA256(signatureString, BUY_LINK_SECRET).toString();
  baseParams['signature'] = signature;

  const urlParams = new URLSearchParams(baseParams);
  return `https://secure.2checkout.com/order/checkout.php?${urlParams.toString()}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('=== Generate Invoice Request ===');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || userProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const body: GenerateInvoiceRequest = await req.json();
    const { orderIds, customerId, returnUrl, cancelUrl } = body;

    if (!orderIds || orderIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one order ID is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, title, final_price, customer_id, customers(email, name)')
      .in('id', orderIds)
      .eq('customer_id', customerId);

    if (ordersError || !orders || orders.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Orders not found or invalid customer' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const totalAmount = orders.reduce((sum, order) => sum + (order.final_price || 0), 0);

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        customer_id: customerId,
        order_ids: orderIds,
        total_amount: totalAmount,
        status: 'pending',
        created_by: user.id,
      })
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('Error creating invoice:', invoiceError);
      return new Response(
        JSON.stringify({ error: 'Failed to create invoice' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const products: Product[] = orders.map(order => ({
      name: order.title || order.order_number,
      price: order.final_price || 0,
      quantity: 1,
    }));

    const customerEmail = orders[0].customers?.email || '';
    const customerName = orders[0].customers?.name || '';

    const paymentLink = generatePaymentLink({
      invoiceId: invoice.id,
      products,
      currency: 'USD',
      returnUrl: returnUrl || `${req.headers.get('origin')}/payment/success`,
      cancelUrl: cancelUrl || `${req.headers.get('origin')}/payment/cancelled`,
    });

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ payment_link: paymentLink })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('Error updating invoice with payment link:', updateError);
    }

    const { error: orderUpdateError } = await supabase
      .from('orders')
      .update({
        invoice_id: invoice.id,
        payment_status: 'pending_payment',
      })
      .in('id', orderIds);

    if (orderUpdateError) {
      console.error('Error updating orders with invoice:', orderUpdateError);
    }

    await supabase.from('notifications').insert({
      user_id: customerId,
      type: 'invoice_generated',
      title: 'Payment Invoice Generated',
      message: `An invoice has been generated for ${orders.length} order(s). Total: $${totalAmount.toFixed(2)}`,
      related_id: invoice.id,
    });

    console.log('Invoice created successfully:', invoice.id);

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          id: invoice.id,
          total_amount: totalAmount,
          payment_link: paymentLink,
          order_count: orders.length,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});