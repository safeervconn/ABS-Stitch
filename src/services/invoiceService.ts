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
    throw new Error('Failed to create invoice');
  }

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

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ payment_link: paymentLink })
    .eq('id', invoice.id);

  if (updateError) {
    throw new Error('Failed to update invoice with payment link');
  }

  const { error: ordersError } = await supabase
    .from('orders')
    .update({
      invoice_id: invoice.id,
      payment_status: 'pending_payment'
    })
    .in('id', order_ids);

  if (ordersError) {
    throw new Error('Failed to link orders to invoice');
  }

  return { invoice, paymentLink };
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
