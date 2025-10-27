import { supabase } from '../lib/supabase';

export interface CreateInvoiceParams {
  customer_id: string;
  invoice_title: string;
  month_year: string;
  order_ids: string[];
  total_amount: number;
}

export interface CreateInvoiceWithPaymentParams extends CreateInvoiceParams {
  customerEmail: string;
  customerName: string;
  products: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export async function createInvoiceWithPayment(params: CreateInvoiceWithPaymentParams) {
  const {
    customer_id,
    invoice_title,
    month_year,
    order_ids,
    total_amount,
    customerEmail,
    customerName,
    products
  } = params;

  if (!products || products.length === 0) {
    throw new Error('At least one product is required for payment');
  }

  const baseUrl = window.location.origin;
  const returnUrl = `${baseUrl}/payment/success`;
  const cancelUrl = `${baseUrl}/payment/failure`;

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      customer_id,
      invoice_title,
      month_year,
      order_ids,
      total_amount,
      status: 'unpaid',
    })
    .select()
    .single();

  if (invoiceError || !invoice) {
    console.error('Invoice creation error:', invoiceError);
    throw new Error(`Failed to create invoice: ${invoiceError?.message || 'Unknown error'}`);
  }

  try {
    const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
      'generate-2co-payment-url',
      {
        body: {
          invoiceId: invoice.id,
          products,
          returnUrl,
          cancelUrl,
          currency: 'USD',
        },
      }
    );

    if (paymentError) {
      console.error('Payment URL generation error:', paymentError);
      throw new Error(`Failed to generate payment URL: ${paymentError.message}`);
    }

    if (!paymentData || !paymentData.checkoutUrl) {
      throw new Error('Invalid response from payment URL generator');
    }

    const paymentLink = paymentData.checkoutUrl;

    const { error: updateError } = await supabase
      .from('invoices')
      .update({ payment_link: paymentLink })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('Failed to update invoice with payment link:', updateError);
      throw new Error('Failed to update invoice with payment link');
    }

    try {
      const { notifyAboutInvoiceCreation } = await import('./notificationService');
      await notifyAboutInvoiceCreation(customer_id, invoice_title);
    } catch (notificationError) {
      console.error('Error creating invoice notifications:', notificationError);
    }

    const { data: updatedOrders, error: ordersError } = await supabase
      .from('orders')
      .update({
        invoice_id: invoice.id,
        payment_status: 'pending_payment'
      })
      .in('id', order_ids)
      .select();

    if (ordersError) {
      console.error('Orders update error:', ordersError);
      throw new Error(`Failed to link orders to invoice: ${ordersError.message}`);
    }

    return { invoice, paymentLink };
  } catch (error) {
    console.error('Error during invoice payment setup:', error);

    await supabase
      .from('invoices')
      .delete()
      .eq('id', invoice.id);

    throw error;
  }
}

export async function updateInvoiceWithTransaction(
  invoiceId: string,
  tcoReferenceNumber: string,
  tcoOrderId: string,
  tcoPaymentMethod: string
) {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      tco_reference_number: tcoReferenceNumber,
      tco_order_id: tcoOrderId,
      tco_payment_method: tcoPaymentMethod,
    })
    .eq('id', invoiceId);

  if (error) {
    throw new Error('Failed to update invoice with transaction details');
  }
}

export async function getInvoiceByReferenceNumber(refNo: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('tco_reference_number', refNo)
    .single();

  if (error) {
    return null;
  }

  return data;
}
