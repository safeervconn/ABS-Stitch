import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import CryptoJS from "npm:crypto-js@4.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const INS_SECRET_WORD = Deno.env.get("VITE_2CO_INS_SECRET_WORD") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function verifyINSSignature(payload: Record<string, string>): boolean {
  try {
    const receivedHash = payload.HASH;
    const payloadCopy = { ...payload };
    delete payloadCopy.HASH;

    const keys = Object.keys(payloadCopy).sort();
    let signatureString = '';

    for (const key of keys) {
      const value = payloadCopy[key] || '';
      signatureString += `${value.length}${value}`;
    }

    const calculatedHash = CryptoJS.MD5(signatureString + INS_SECRET_WORD).toString();

    return calculatedHash === receivedHash;
  } catch (error) {
    console.error('Error verifying INS signature:', error);
    return false;
  }
}

async function copyStockDesignFiles(supabase: any, orderId: string) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_number, stock_design_id, stock_designs(attachment_url, attachment_filename)')
      .eq('id', orderId)
      .single();

    if (orderError || !order || !order.stock_design_id) {
      console.log('Not a stock design order or order not found:', orderId);
      return;
    }

    const attachmentUrl = order.stock_designs?.attachment_url;
    const attachmentFilename = order.stock_designs?.attachment_filename;

    if (!attachmentUrl || !attachmentFilename) {
      console.log('No attachment found for stock design:', orderId);
      return;
    }

    const sourcePath = attachmentUrl;
    const targetPath = `orders/${order.order_number}/${attachmentFilename}`;

    const { data: sourceFile, error: downloadError } = await supabase.storage
      .from('stock-design-files')
      .download(sourcePath);

    if (downloadError) {
      console.error('Error downloading source file:', downloadError);
      throw downloadError;
    }

    const { error: uploadError } = await supabase.storage
      .from('order-attachments')
      .upload(targetPath, sourceFile, {
        contentType: 'application/zip',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading to order-attachments:', uploadError);
      throw uploadError;
    }

    const { data: attachmentData, error: attachmentError } = await supabase
      .from('order_attachments')
      .insert({
        order_id: orderId,
        filename: attachmentFilename,
        file_path: targetPath,
        file_size: sourceFile.size,
        uploaded_by: null
      });

    if (attachmentError) {
      console.error('Error creating attachment record:', attachmentError);
    }

    console.log('Successfully copied file for order:', orderId);
  } catch (error) {
    console.error('Error in copyStockDesignFiles:', error);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        message: '2Checkout IPN endpoint is active',
        status: 'ready'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const contentType = req.headers.get('content-type') || '';
    let payload: Record<string, string> = {};

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        payload[key] = value.toString();
      }
    } else if (contentType.includes('application/json')) {
      const jsonData = await req.json();
      payload = jsonData;
    } else {
      const text = await req.text();
      if (text) {
        const params = new URLSearchParams(text);
        for (const [key, value] of params.entries()) {
          payload[key] = value;
        }
      }
    }

    console.log('Received webhook payload:', JSON.stringify(payload, null, 2));

    if (Object.keys(payload).length === 0) {
      console.log('Empty payload - likely a test request from 2CO');
      return new Response(
        JSON.stringify({ message: 'Endpoint is active and ready' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    if (!payload.HASH) {
      console.error('Missing HASH in payload');
      return new Response(
        JSON.stringify({ message: 'Received but missing signature' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    if (!verifyINSSignature(payload)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ message: 'Signature verification failed' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const refNo = payload.REFNO;
    const orderNo = payload.ORDERNO;
    const orderStatus = payload.ORDERSTATUS;
    const paymentAmount = parseFloat(payload.PAYMENTAMOUNT || '0');
    const paymentMethod = payload.PAYMENTMETHOD;
    const merchantOrderId = payload['merchant-order-id'] || payload.MERCHANT_ORDER_ID;

    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('tco_reference_number', refNo)
      .single();

    if (existingInvoice && existingInvoice.status === 'paid') {
      console.log('Invoice already processed:', refNo);
      return new Response(
        JSON.stringify({ message: 'Already processed' }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    let invoiceId = merchantOrderId;

    if (!invoiceId && existingInvoice) {
      invoiceId = existingInvoice.id;
    }

    if (!invoiceId) {
      console.error('No invoice ID found');
      return new Response(
        JSON.stringify({ error: 'Invoice ID not found' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('total_amount, order_ids')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      console.error('Invoice not found:', invoiceId);
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    if (Math.abs(paymentAmount - invoice.total_amount) > 0.01) {
      console.error('Payment amount mismatch');
      return new Response(
        JSON.stringify({ error: 'Amount mismatch' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const successStatuses = ['COMPLETE', 'AUTHRECEIVED', 'PAYMENT_AUTHORIZED'];
    const isPaymentSuccessful = successStatuses.includes(orderStatus.toUpperCase());

    if (isPaymentSuccessful) {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          tco_reference_number: refNo,
          tco_order_id: orderNo,
          tco_payment_method: paymentMethod,
        })
        .eq('id', invoiceId);

      if (updateError) {
        console.error('Error updating invoice:', updateError);
        throw updateError;
      }

      for (const orderId of invoice.order_ids) {
        await copyStockDesignFiles(supabase, orderId);
      }

      console.log('Payment processed successfully for invoice:', invoiceId);
    }

    return new Response(
      JSON.stringify({ message: 'Webhook processed successfully' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
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