import { supabase } from '../lib/supabase';
import type { AdminOrder } from '../admin/types';

export interface OrderTransformData {
  id: string;
  order_number: string;
  order_type: string;
  total_amount: number;
  payment_status: string;
  customer_id: string;
  customer?: {
    full_name: string;
    email: string;
    phone?: string;
    company_name?: string;
  };
  stockdesign_id?: string;
  stockdesign?: {
    title: string;
  };
  category_id?: string;
  category?: {
    category_name: string;
  };
  custom_description?: string;
  custom_width?: number;
  custom_height?: number;
  status: string;
  assigned_sales_rep_id?: string;
  sales_rep?: {
    full_name: string;
  };
  assigned_designer_id?: string;
  designer?: {
    full_name: string;
  };
  invoice_url?: string;
  created_at: string;
  updated_at: string;
}

export function transformOrderData(order: OrderTransformData, firstAttachmentId?: string): AdminOrder {
  return {
    id: order.id,
    order_number: order.order_number,
    order_type: order.order_type,
    total_amount: order.total_amount,
    payment_status: order.payment_status,
    customer_id: order.customer_id,
    customer_name: order.customer?.full_name || 'Unknown',
    customer_email: order.customer?.email || '',
    customer_phone: order.customer?.phone || '',
    customer_company_name: order.customer?.company_name || '',
    stockdesign_id: order.stockdesign_id,
    stockdesign_title: order.stockdesign?.title,
    custom_description: order.custom_description,
    first_attachment_id: firstAttachmentId,
    category_id: order.category_id,
    category_name: order.category?.category_name,
    custom_width: order.custom_width,
    custom_height: order.custom_height,
    status: order.status,
    assigned_sales_rep_id: order.assigned_sales_rep_id,
    assigned_sales_rep_name: order.sales_rep?.full_name,
    assigned_designer_id: order.assigned_designer_id,
    assigned_designer_name: order.designer?.full_name,
    invoice_url: order.invoice_url,
    created_at: order.created_at,
    updated_at: order.updated_at,
  };
}

export async function fetchFirstAttachmentsForOrders(
  orderIds: string[]
): Promise<Record<string, string>> {
  if (orderIds.length === 0) return {};

  const firstAttachmentsMap: Record<string, string> = {};

  try {
    const { data: attachments } = await supabase
      .from('order_attachments')
      .select('id, order_id')
      .in('order_id', orderIds)
      .order('uploaded_at', { ascending: true });

    if (attachments) {
      attachments.forEach(att => {
        if (!firstAttachmentsMap[att.order_id]) {
          firstAttachmentsMap[att.order_id] = att.id;
        }
      });
    }
  } catch (error) {
    console.error('Error fetching attachments:', error);
  }

  return firstAttachmentsMap;
}

export const ORDER_SELECT_FIELDS = `
  *,
  customer:customers!inner(full_name, email, phone, company_name),
  stockdesign:stockdesigns(title),
  category:categories(category_name),
  sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
  designer:employees!orders_assigned_designer_id_fkey(full_name)
`;

export const ORDER_SELECT_FIELDS_CUSTOMER = `
  *,
  customer:customers!inner(full_name, email, phone, company_name),
  stockdesign:stockdesigns(title),
  category:categories(category_name)
`;

export async function enrichOrdersWithAttachments(
  orders: AdminOrder[]
): Promise<AdminOrder[]> {
  const orderIds = orders.map(order => order.id);
  const attachmentsMap = await fetchFirstAttachmentsForOrders(orderIds);

  return orders.map(order => ({
    ...order,
    first_attachment_id: attachmentsMap[order.id],
  }));
}
