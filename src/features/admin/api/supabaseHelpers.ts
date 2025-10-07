/**
 * Admin API Helper Functions
 * 
 * Comprehensive database operations for admin functionality:
 * - CRUD operations for users, customers, orders, products, invoices
 * - Dashboard statistics and analytics
 * - Notification management
 * - File upload and storage operations
 * - Role-based access control
 * - Optimized queries with proper error handling
 */

import { supabase } from '../../../api/client';
import { getCurrentUser as getSupabaseCurrentUser } from '../../../api/auth';
import { getUserProfile as getSupabaseUserProfile } from '../../../api/users';
import { AdminUser, AdminCustomer, AdminOrder, AdminProduct, AdminStats, PaginatedResponse, PaginationParams, Invoice, OrderComment } from '../../../types';

/**
 * Fetch comprehensive admin dashboard statistics
 * Calculates metrics for current month including orders, customers, revenue
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfMonthISO = firstDayOfMonth.toISOString();

    // Parallel queries for better performance
    const [ordersResult, customersResult, revenueResult, productsResult] = await Promise.all([
      // Orders this month
      supabase
        .from('orders')
        .select('id, status')
        .gte('created_at', firstDayOfMonthISO),
      
      // Customers this month
      supabase
        .from('customers')
        .select('id')
        .gte('created_at', firstDayOfMonthISO),
      
      // Revenue this month
      supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', firstDayOfMonthISO)
        .eq('payment_status', 'paid'),
      
      // Active products
      supabase
        .from('products')
        .select('id')
        .eq('status', 'active')
    ]);

    const orders = ordersResult.data || [];
    const customers = customersResult.data || [];
    const revenue = revenueResult.data || [];
    const products = productsResult.data || [];

    // Calculate statistics
    const totalRevenueThisMonth = revenue.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const newOrdersCount = orders.filter(order => order.status === 'new').length;
    const inProgressOrders = orders.filter(order => order.status === 'in_progress').length;
    const underReviewOrdersCount = orders.filter(order => order.status === 'under_review').length;

    return {
      totalOrdersThisMonth: orders.length,
      newCustomersThisMonth: customers.length,
      totalRevenueThisMonth,
      inProgressOrders,
      activeProducts: products.length,
      newOrdersCount,
      underReviewOrdersCount
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * Fetch paginated users with filtering and sorting
 */
export const getUsers = async (params: PaginationParams): Promise<PaginatedResponse<AdminUser>> => {
  try {
    let query = supabase.from('employees').select('*', { count: 'exact' });

    // Apply filters
    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }
    if (params.role) {
      query = query.eq('role', params.role);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit)
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

/**
 * Fetch paginated customers with filtering and sorting
 */
export const getCustomers = async (params: PaginationParams): Promise<PaginatedResponse<AdminCustomer>> => {
  try {
    let query = supabase
      .from('customers')
      .select(`
        *,
        sales_rep:employees!customers_assigned_sales_rep_id_fkey(full_name)
      `, { count: 'exact' });

    // Apply filters
    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%,company_name.ilike.%${params.search}%`);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Transform data to include sales rep name
    const transformedData = (data || []).map(customer => ({
      ...customer,
      assigned_sales_rep_name: customer.sales_rep?.full_name || 'Unassigned'
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit)
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Fetch paginated orders with comprehensive filtering
 */
export const getOrders = async (params: PaginationParams): Promise<PaginatedResponse<AdminOrder>> => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(id, full_name),
        designer:employees!orders_assigned_designer_id_fkey(id, full_name)
      `, { count: 'exact' });

    // Apply filters
    if (params.search) {
      query = query.or(`order_number.ilike.%${params.search}%,custom_description.ilike.%${params.search}%`);
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
    if (params.customerSearch) {
      // Join with customers table for name search
      query = query.or(`customer.full_name.ilike.%${params.customerSearch}%,customer.email.ilike.%${params.customerSearch}%`);
    }
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }
    if (params.amountMin) {
      query = query.gte('total_amount', params.amountMin);
    }
    if (params.amountMax) {
      query = query.lte('total_amount', params.amountMax);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Transform data to match AdminOrder interface
    const transformedData: AdminOrder[] = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
      order_type: order.order_type,
      customer_id: order.customer_id,
      customer_name: order.customer?.full_name || 'Unknown',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      customer_company_name: order.customer?.company_name || '',
      product_id: order.product_id,
      product_title: order.product?.title,
      custom_description: order.custom_description,
      file_urls: order.file_urls || (order.file_url ? [order.file_url] : undefined),
      apparel_type_id: order.apparel_type_id,
      apparel_type_name: order.apparel_type?.type_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      total_amount: order.total_amount || 0,
      payment_status: order.payment_status || 'unpaid',
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: order.sales_rep?.full_name || 'Unassigned',
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: order.designer?.full_name || 'Unassigned',
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit)
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Fetch paginated products with filtering
 */
export const getProducts = async (params: PaginationParams): Promise<PaginatedResponse<AdminProduct>> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        apparel_type:apparel_types(type_name)
      `, { count: 'exact' });

    // Apply filters
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }
    if (params.apparelTypeId) {
      query = query.eq('apparel_type_id', params.apparelTypeId);
    }
    if (params.priceMin) {
      query = query.gte('price', params.priceMin);
    }
    if (params.priceMax) {
      query = query.lte('price', params.priceMax);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Transform data to include apparel type name
    const transformedData = (data || []).map(product => ({
      ...product,
      apparel_type_name: product.apparel_type?.type_name
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit)
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Create new user with role validation
 */
export const createUser = async (userData: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>): Promise<AdminUser> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update existing user with validation
 */
export const updateUser = async (id: string, userData: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete user with cascade handling
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Update customer information
 */
export const updateCustomer = async (id: string, customerData: Partial<AdminCustomer>): Promise<AdminCustomer> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update({ ...customerData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

/**
 * Delete customer with cascade handling
 */
export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

/**
 * Update order with comprehensive field support
 */
export const updateOrder = async (id: string, orderData: Partial<AdminOrder>): Promise<AdminOrder> => {
  try {
    const updateData: any = {
      ...orderData,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.order_number;
    delete updateData.customer_name;
    delete updateData.customer_email;
    delete updateData.customer_phone;
    delete updateData.customer_company_name;
    delete updateData.product_title;
    delete updateData.apparel_type_name;
    delete updateData.assigned_sales_rep_name;
    delete updateData.assigned_designer_name;
    delete updateData.created_at;

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        customer:customers(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
        designer:employees!orders_assigned_designer_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    // Transform response to match AdminOrder interface
    return {
      id: data.id,
      order_number: data.order_number || `ORD-${data.id.slice(0, 8)}`,
      order_type: data.order_type,
      customer_id: data.customer_id,
      customer_name: data.customer?.full_name || 'Unknown',
      customer_email: data.customer?.email || '',
      customer_phone: data.customer?.phone || '',
      customer_company_name: data.customer?.company_name || '',
      product_id: data.product_id,
      product_title: data.product?.title,
      custom_description: data.custom_description,
      file_urls: data.file_urls,
      apparel_type_id: data.apparel_type_id,
      apparel_type_name: data.apparel_type?.type_name,
      custom_width: data.custom_width,
      custom_height: data.custom_height,
      total_amount: data.total_amount || 0,
      payment_status: data.payment_status || 'unpaid',
      status: data.status,
      assigned_sales_rep_id: data.assigned_sales_rep_id,
      assigned_sales_rep_name: data.sales_rep?.full_name || 'Unassigned',
      assigned_designer_id: data.assigned_designer_id,
      assigned_designer_name: data.designer?.full_name || 'Unassigned',
      invoice_url: data.invoice_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

/**
 * Create new product with image upload support
 */
export const createProduct = async (productData: Omit<AdminProduct, 'id' | 'created_at' | 'updated_at'>): Promise<AdminProduct> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select(`
        *,
        apparel_type:apparel_types(type_name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      apparel_type_name: data.apparel_type?.type_name
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update existing product
 */
export const updateProduct = async (id: string, productData: Partial<AdminProduct>): Promise<AdminProduct> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        apparel_type:apparel_types(type_name)
      `)
/**
 * Get all sales representatives for assignment dropdowns
 */
export const getSalesReps = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name, email')
      .eq('role', 'sales_rep')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sales reps:', error);
    throw error;
  }
};

/**
 * Get all designers for assignment dropdowns
 */
export const getDesigners = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name, email')
      .eq('role', 'designer')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching designers:', error);
    throw error;
  }
};

/**
 * Get apparel types for product forms
 */
export const getApparelTypes = async () => {
  const { getApparelTypes: getApparelTypesFromProducts } = await import('../../../api/products');
  return getApparelTypesFromProducts();
};

/**
 * Upload file to Supabase storage
 */
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase storage
 */
export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const bucket = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw here as file deletion is not critical
  }
};

/**
 * Get dashboard stats for sales representative
 */
export const getSalesRepDashboardStats = async (salesRepId: string) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfMonthISO = firstDayOfMonth.toISOString();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status')
      .eq('assigned_sales_rep_id', salesRepId);

    if (error) throw error;

    const ordersThisMonth = orders?.filter(order => 
      new Date(order.created_at) >= firstDayOfMonth
    ) || [];

    return {
      totalOrdersThisMonth: ordersThisMonth.length,
      newOrdersCount: orders?.filter(order => order.status === 'new').length || 0,
      inProgressOrdersCount: orders?.filter(order => order.status === 'in_progress').length || 0,
      underReviewOrdersCount: orders?.filter(order => order.status === 'under_review').length || 0
    };
  } catch (error) {
    console.error('Error fetching sales rep dashboard stats:', error);
    throw error;
  }
};

/**
 * Get dashboard stats for designer
 */
export const getDesignerDashboardStats = async (designerId: string) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfMonthISO = firstDayOfMonth.toISOString();

    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, status, created_at')
      .eq('assigned_designer_id', designerId);

    if (error) throw error;

    const ordersThisMonth = orders?.filter(order => 
      new Date(order.created_at) >= firstDayOfMonth
    ) || [];

    return {
      totalOrdersThisMonth: ordersThisMonth.length,
      inProgressOrdersCount: orders?.filter(order => order.status === 'in_progress').length || 0
    };
  } catch (error) {
    console.error('Error fetching designer dashboard stats:', error);
    throw error;
  }
};

/**
 * Get paginated invoices with filtering
 */
export const getInvoices = async (params: PaginationParams): Promise<PaginatedResponse<Invoice>> => {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(full_name, email, company_name)
      `, { count: 'exact' });

    // Apply filters
    if (params.search) {
      query = query.or(`invoice_title.ilike.%${params.search}%,month_year.ilike.%${params.search}%`);
    }
    if (params.invoiceStatus) {
      query = query.eq('status', params.invoiceStatus);
    }
    if (params.invoiceCustomerId) {
      query = query.eq('customer_id', params.invoiceCustomerId);
    }
    if (params.invoiceMonthYear) {
      query = query.eq('month_year', params.invoiceMonthYear);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const offset = (params.page - 1) * params.limit;
    query = query.range(offset, offset + params.limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // Transform data to include customer info
    const transformedData = (data || []).map(invoice => ({
      ...invoice,
      customer_name: invoice.customer?.full_name,
      customer_email: invoice.customer?.email,
      customer_company_name: invoice.customer?.company_name
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit)
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

/**
 * Get customers for invoice generation
 */
export const getCustomersForInvoice = async () => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, email, company_name')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers for invoice:', error);
    throw error;
  }
};

/**
 * Get unpaid orders for customer
 */
export const getUnpaidOrdersForCustomer = async (customerId: string): Promise<AdminOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name)
      `)
      .eq('customer_id', customerId)
      .eq('payment_status', 'unpaid')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
      order_type: order.order_type,
      customer_id: order.customer_id,
      customer_name: order.customer?.full_name || 'Unknown',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      customer_company_name: order.customer?.company_name || '',
      product_id: order.product_id,
      product_title: order.product?.title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      apparel_type_id: order.apparel_type_id,
      apparel_type_name: order.apparel_type?.type_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      total_amount: order.total_amount || 0,
      payment_status: order.payment_status || 'unpaid',
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: 'Unassigned',
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: 'Unassigned',
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at
    }));
  } catch (error) {
    console.error('Error fetching unpaid orders:', error);
    throw error;
  }
};

/**
 * Create new invoice
 */
export const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select(`
        *,
        customer:customers(full_name, email, company_name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      customer_name: data.customer?.full_name,
      customer_email: data.customer?.email,
      customer_company_name: data.customer?.company_name
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Get invoice by ID with related data
 */
export const getInvoiceById = async (id: string): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(full_name, email, company_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      customer_name: data.customer?.full_name,
      customer_email: data.customer?.email,
      customer_company_name: data.customer?.company_name
    };
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ ...invoiceData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        customer:customers(full_name, email, company_name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      customer_name: data.customer?.full_name,
      customer_email: data.customer?.email,
      customer_company_name: data.customer?.company_name
    };
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

/**
 * Get orders by IDs for invoice details
 */
export const getOrdersByIds = async (orderIds: string[]): Promise<AdminOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name)
      `)
      .in('id', orderIds);

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
      order_type: order.order_type,
      customer_id: order.customer_id,
      customer_name: order.customer?.full_name || 'Unknown',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      customer_company_name: order.customer?.company_name || '',
      product_id: order.product_id,
      product_title: order.product?.title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      apparel_type_id: order.apparel_type_id,
      apparel_type_name: order.apparel_type?.type_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      total_amount: order.total_amount || 0,
      payment_status: order.payment_status || 'unpaid',
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: 'Unassigned',
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: 'Unassigned',
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at
    }));
  } catch (error) {
    console.error('Error fetching orders by IDs:', error);
    throw error;
  }
};

/**
 * Get all customer orders for invoice management
 */
export const getAllCustomerOrders = async (customerId: string): Promise<AdminOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
      order_type: order.order_type,
      customer_id: order.customer_id,
      customer_name: order.customer?.full_name || 'Unknown',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      customer_company_name: order.customer?.company_name || '',
      product_id: order.product_id,
      product_title: order.product?.title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      apparel_type_id: order.apparel_type_id,
      apparel_type_name: order.apparel_type?.type_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      total_amount: order.total_amount || 0,
      payment_status: order.payment_status || 'unpaid',
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: 'Unassigned',
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: 'Unassigned',
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at
    }));
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};