import { supabase } from '../lib/supabase';
import { generatePaymentLink } from './twoCheckoutService';

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

  console.log('=== createInvoiceWithPayment START ===');
  console.log('Order IDs to link:', order_ids);
  console.log('Products for payment:', products);

  if (!products || products.length === 0) {
    console.error('No products provided for payment link');
    throw new Error('At least one product is required for payment');
  }

  const baseUrl = window.location.origin;
  const returnUrl = `${baseUrl}/payment/success`;
  const cancelUrl = `${baseUrl}/payment/failure`;

  console.log('Creating invoice...');
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

  console.log('Invoice created successfully:', invoice.id);

  try {
    console.log('Generating payment link...');
    const paymentLink = generatePaymentLink({
      invoiceId: invoice.id,
      amount: total_amount,
      currency: 'USD',
      products,
      customerEmail,
      customerName,
      returnUrl,
      cancelUrl,
    });

    console.log('Payment link generated:', paymentLink);

    console.log('Updating invoice with payment link...');
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ payment_link: paymentLink })
      .eq('id', invoice.id);

    if (updateError) {
      console.error('Failed to update invoice with payment link:', updateError);
      throw new Error('Failed to update invoice with payment link');
    }

    console.log('Linking orders to invoice...');
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

    console.log('Orders linked successfully:', updatedOrders?.length || 0);
    console.log('=== createInvoiceWithPayment SUCCESS ===');

    return { invoice, paymentLink };
  } catch (error) {
    console.error('Error during invoice payment setup:', error);
    console.log('Cleaning up: deleting invoice', invoice.id);

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
