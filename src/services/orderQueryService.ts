import { supabase } from '../lib/supabase';
import type { AdminOrder, PaginationParams, PaginatedResponse } from '../admin/types';

export async function getOrdersFromView(params: PaginationParams): Promise<PaginatedResponse<AdminOrder>> {
  try {
    let query = supabase
      .from('orders_with_details')
      .select('*', { count: 'exact' });

    if (params.search) {
      query = query.or(`order_number.ilike.%${params.search}%,order_name.ilike.%${params.search}%,custom_description.ilike.%${params.search}%,customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%`);
    }

    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    if (params.paymentStatus) {
      query = query.eq('payment_status', params.paymentStatus);
    }

    if (params.salesRepId) {
      query = query.eq('assigned_sales_rep_id', params.salesRepId);
    }

    if (params.assignedDesignerId) {
      query = query.eq('assigned_designer_id', params.assignedDesignerId);
    }

    if (params.amountMin !== undefined && !isNaN(params.amountMin) && params.amountMin >= 0) {
      query = query.gte('total_amount', params.amountMin);
    }
    if (params.amountMax !== undefined && !isNaN(params.amountMax) && params.amountMax >= 0) {
      query = query.lte('total_amount', params.amountMax);
    }

    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const transformedData = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      order_name: order.order_name,
      order_type: order.order_type,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      customer_id: order.customer_id,
      customer_name: order.customer_name || 'Unknown',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      customer_company_name: order.customer_company_name || '',
      stock_design_id: order.stock_design_id,
      stock_design_title: order.stock_design_title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      first_attachment_id: order.first_attachment_id,
      category_id: order.category_id,
      category_name: order.category_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: order.sales_rep_name,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: order.designer_name,
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    };
  } catch (error) {
    console.error('Error fetching orders from view:', error);
    throw error;
  }
}

export async function getRecentOrdersFromView(limit: number = 10): Promise<AdminOrder[]> {
  try {
    const { data, error } = await supabase
      .from('orders_with_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      customer_id: order.customer_id,
      customer_name: order.customer_name || 'Unknown',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      customer_company_name: order.customer_company_name || '',
      stock_design_id: order.stock_design_id,
      stock_design_title: order.stock_design_title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      first_attachment_id: order.first_attachment_id,
      category_id: order.category_id,
      category_name: order.category_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: order.sales_rep_name,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: order.designer_name,
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching recent orders from view:', error);
    return [];
  }
}

export async function getOrderByIdFromView(id: string): Promise<AdminOrder | null> {
  try {
    const { data, error } = await supabase
      .from('orders_with_details')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      order_number: data.order_number,
      order_type: data.order_type,
      total_amount: data.total_amount,
      payment_status: data.payment_status,
      customer_id: data.customer_id,
      customer_name: data.customer_name || 'Unknown',
      customer_email: data.customer_email || '',
      customer_phone: data.customer_phone || '',
      customer_company_name: data.customer_company_name || '',
      stock_design_id: data.stock_design_id,
      stock_design_title: data.stock_design_title,
      custom_description: data.custom_description,
      file_urls: data.file_urls,
      first_attachment_id: data.first_attachment_id,
      category_id: data.category_id,
      category_name: data.category_name,
      custom_width: data.custom_width,
      custom_height: data.custom_height,
      status: data.status,
      assigned_sales_rep_id: data.assigned_sales_rep_id,
      assigned_sales_rep_name: data.sales_rep_name,
      assigned_designer_id: data.assigned_designer_id,
      assigned_designer_name: data.designer_name,
      invoice_url: data.invoice_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching order by ID from view:', error);
    return null;
  }
}

export async function getCustomerOrdersFromView(
  customerId: string,
  params: PaginationParams
): Promise<PaginatedResponse<AdminOrder>> {
  try {
    let query = supabase
      .from('orders_with_details')
      .select('*', { count: 'exact' })
      .eq('customer_id', customerId);

    if (params.search) {
      query = query.or(`order_number.ilike.%${params.search}%,order_name.ilike.%${params.search}%,custom_description.ilike.%${params.search}%`);
    }

    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const transformedData = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      order_name: order.order_name,
      order_type: order.order_type,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      customer_id: order.customer_id,
      customer_name: order.customer_name || 'Unknown',
      customer_email: order.customer_email || '',
      customer_phone: order.customer_phone || '',
      customer_company_name: order.customer_company_name || '',
      stock_design_id: order.stock_design_id,
      stock_design_title: order.stock_design_title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      first_attachment_id: order.first_attachment_id,
      category_id: order.category_id,
      category_name: order.category_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: order.sales_rep_name,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: order.designer_name,
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    };
  } catch (error) {
    console.error('Error fetching customer orders from view:', error);
    throw error;
  }
}
