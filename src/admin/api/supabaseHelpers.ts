import { supabase } from '../../lib/supabase';
import { getCurrentUser as getSupabaseCurrentUser, getUserProfile as getSupabaseUserProfile } from '../../lib/supabase';
import { AdminUser, AdminCustomer, AdminOrder, AdminProduct, Category, AdminStats, PaginatedResponse, PaginationParams, Invoice, OrderComment } from '../types';
import { notifyAdminsAboutNewEmployee, notifyAdminsAboutNewCustomer, notifyAboutOrderStatusChange, notifyDesignerAboutAssignment, notifyCustomerAboutInvoice } from '../../services/notificationService';

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const { data, error } = await supabase.rpc('calculate_dashboard_stats');

    if (error) throw error;

    return data || {
      totalOrdersThisMonth: 0,
      newCustomersThisMonth: 0,
      totalRevenueThisMonth: 0,
      inProgressOrders: 0,
      activeProducts: 0,
      newOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalOrdersThisMonth: 0,
      newCustomersThisMonth: 0,
      totalRevenueThisMonth: 0,
      inProgressOrders: 0,
      activeProducts: 0,
      newOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  }
};

export const getSalesRepDashboardStats = async (salesRepId: string) => {
  try {
    const { data, error } = await supabase.rpc('calculate_sales_rep_stats', {
      rep_id: salesRepId
    });

    if (error) throw error;

    return data || {
      totalOrdersThisMonth: 0,
      newOrdersCount: 0,
      inProgressOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  } catch (error) {
    console.error('Error fetching sales rep stats:', error);
    return {
      totalOrdersThisMonth: 0,
      newOrdersCount: 0,
      inProgressOrdersCount: 0,
      underReviewOrdersCount: 0,
    };
  }
};

export const getDesignerDashboardStats = async (designerId: string) => {
  try {
    const { data, error } = await supabase.rpc('calculate_designer_stats', {
      designer_id: designerId
    });

    if (error) throw error;

    return data || {
      totalOrdersThisMonth: 0,
      inProgressOrdersCount: 0,
    };
  } catch (error) {
    console.error('Error fetching designer stats:', error);
    return {
      totalOrdersThisMonth: 0,
      inProgressOrdersCount: 0,
    };
  }
};
// Recent Orders Query
export const getRecentOrders = async (limit: number = 10): Promise<AdminOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
        designer:employees!orders_assigned_designer_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Fetch first attachment ID for each order
    const orderIds = (data || []).map(order => order.id);
    let firstAttachmentsMap: Record<string, string> = {};

    if (orderIds.length > 0) {
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
      } catch (attachmentError) {
        console.error('Error fetching attachments:', attachmentError);
      }
    }

    return (data || []).map(order => ({
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
      product_id: order.product_id,
      product_title: order.product?.title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      first_attachment_id: firstAttachmentsMap[order.id],
      apparel_type_id: order.apparel_type_id,
      apparel_type_name: order.apparel_type?.type_name,
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
    }));
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
};


// Users CRUD Operations (Employees)
export const getUsers = async (params: PaginationParams): Promise<PaginatedResponse<AdminUser>> => {
  try {
    let query = supabase
      .from('employees')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    // Apply role filter
    if (params.role) {
      query = query.eq('role', params.role);
    }

    // Apply status filter
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    // Apply date range filters
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (userData: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email!,
      password: 'TempPassword123!', // Temporary password - user should reset
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create auth user');

    // Then create the employee record
    const { data, error } = await supabase
      .from('employees')
      .insert([{
        id: authData.user.id, // Use the auth user ID
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        status: userData.status || 'active',
      }])
      .select()
      .single();

    if (error) {
      // If employee creation fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
    
    try {
      await notifyAdminsAboutNewEmployee(userData.full_name, userData.role || 'employee');
    } catch (notificationError) {
      console.error('Error creating employee creation notifications:', notificationError);
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(userData)
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

// Customer CRUD Operations
export const createCustomer = async (customerData: Partial<AdminCustomer>): Promise<AdminCustomer> => {
  try {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: customerData.email!,
      password: 'TempPassword123!', // Temporary password - user should reset
      email_confirm: true,
      user_metadata: {
        full_name: customerData.full_name,
        role: 'customer'
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create auth user');

    // Then create the customer record
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        id: authData.user.id, // Use the auth user ID
        full_name: customerData.full_name,
        email: customerData.email,
        phone: customerData.phone,
        company_name: customerData.company_name,
        assigned_sales_rep_id: customerData.assigned_sales_rep_id,
        status: customerData.status || 'active',
      }])
      .select()
      .single();

    if (error) {
      // If customer creation fails, clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw error;
    }
    
    try {
      await notifyAdminsAboutNewCustomer(customerData.full_name);
    } catch (notificationError) {
      console.error('Error creating customer creation notifications:', notificationError);
    }

    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customerData: Partial<AdminCustomer>): Promise<AdminCustomer> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .update(customerData)
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

export const deleteCustomer = async (id: string): Promise<void> => {
  try {
    // First delete the customer record
    const { error: customerError } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (customerError) throw customerError;

    // Then delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      console.error('Error deleting auth user:', authError);
      // Don't throw here as the customer record is already deleted
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Customers CRUD Operations
export const getCustomers = async (params: PaginationParams): Promise<PaginatedResponse<AdminCustomer>> => {
  try {
    let query = supabase
      .from('customers')
      .select(`
        *,
        company_name,
        sales_rep:employees!customers_assigned_sales_rep_id_fkey(full_name)
      `, { count: 'exact' });

    // Apply search filter
    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    // Apply status filter
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    // Apply sales rep filter
    if (params.salesRepId) {
      query = query.eq('assigned_sales_rep_id', params.salesRepId);
    }

    // Apply date range filters
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const transformedData = (data || []).map(customer => ({
      ...customer,
      assigned_sales_rep_name: customer.sales_rep?.full_name,
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// Orders CRUD Operations
export const getOrders = async (params: PaginationParams): Promise<PaginatedResponse<AdminOrder>> => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
        designer:employees!orders_assigned_designer_id_fkey(full_name)
      `, { count: 'exact' });

    // Apply comprehensive search filter
    if (params.search) {
      // Search across order number, custom description, and order ID
      query = query.or(`order_number.ilike.%${params.search}%,custom_description.ilike.%${params.search}%`);
    }

    // Apply status filter
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    // Apply customer search filter (separate from main search)
    if (params.customerSearch) {
      // Note: We need to use a different approach for nested table searches
      // This will be handled by filtering the results after the query
    }

    // Apply payment status filter
    if (params.paymentStatus) {
      query = query.eq('payment_status', params.paymentStatus);
    }

    // Apply sales rep filter
    if (params.salesRepId) {
      query = query.eq('assigned_sales_rep_id', params.salesRepId);
    }

    // Apply designer filter
    if (params.assignedDesignerId) {
      query = query.eq('assigned_designer_id', params.assignedDesignerId);
    }

    // Apply amount range filters
    if (params.amountMin !== undefined && !isNaN(params.amountMin) && params.amountMin >= 0) {
      query = query.gte('total_amount', params.amountMin);
    }
    if (params.amountMax !== undefined && !isNaN(params.amountMax) && params.amountMax >= 0) {
      query = query.lte('total_amount', params.amountMax);
    }

    // Apply date range filters
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch first attachment ID for each order
    const orderIds = (data || []).map(order => order.id);
    let firstAttachmentsMap: Record<string, string> = {};

    if (orderIds.length > 0) {
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
      } catch (attachmentError) {
        console.error('Error fetching attachments:', attachmentError);
      }
    }

    let transformedData = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
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
      first_attachment_id: firstAttachmentsMap[order.id],
      apparel_type_id: order.apparel_type_id,
      apparel_type_name: order.apparel_type?.type_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: order.sales_rep?.full_name,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: order.designer?.full_name,
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));

    // Apply customer search filter on transformed data (since we can't do nested OR queries easily in Supabase)
    if (params.customerSearch) {
      const customerSearchLower = params.customerSearch.toLowerCase();
      transformedData = transformedData.filter(order => 
        order.customer_name.toLowerCase().includes(customerSearchLower) ||
        order.customer_email.toLowerCase().includes(customerSearchLower)
      );
    }

    return {
      data: transformedData,
      total: params.customerSearch ? transformedData.length : (count || 0),
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((params.customerSearch ? transformedData.length : (count || 0)) / params.limit),
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrder = async (id: string, orderData: Partial<AdminOrder>): Promise<AdminOrder> => {
  try {
    // Get current user to validate permissions
    const currentUser = await getSupabaseCurrentUser();
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const userProfile = await getSupabaseUserProfile(currentUser.id);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get current order to check status and track changes
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('status, assigned_designer_id, customer_id, apparel_type_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error('Failed to fetch current order status');
    }

    // Validate edit permissions for completed/cancelled orders
    if ((currentOrder.status === 'completed' || currentOrder.status === 'cancelled') &&
        userProfile.role !== 'admin' && userProfile.role !== 'sales_rep') {
      throw new Error('Only administrators and sales representatives can edit completed or cancelled orders');
    }

    // Validate required fields based on status
    if (orderData.status === 'in_progress' && !orderData.assigned_designer_id && !currentOrder.assigned_designer_id) {
      throw new Error('Cannot set order to "In Progress" without assigning a designer');
    }

    if (orderData.status === 'completed') {
      if (!orderData.assigned_sales_rep_id && userProfile.role !== 'admin') {
        throw new Error('Cannot complete order without assigning a sales representative');
      }
      if (orderData.total_amount !== undefined && orderData.total_amount <= 0) {
        throw new Error('Total amount must be greater than 0 for completed orders');
      }
    }

    // Validate total_amount if provided
    if (orderData.total_amount !== undefined && orderData.total_amount < 0) {
      throw new Error('Total amount cannot be negative');
    }

    // Build update object with proper null handling for UUID fields
    const updateData: any = {
      order_type: orderData.order_type,
      custom_width: orderData.custom_width,
      custom_height: orderData.custom_height,
      total_amount: orderData.total_amount,
      file_urls: orderData.file_urls,
      status: orderData.status,
      invoice_url: orderData.invoice_url,
    };

    // Only include UUID fields if they have valid values
    if (orderData.apparel_type_id !== undefined) {
      updateData.apparel_type_id = orderData.apparel_type_id || null;
    }
    if (orderData.assigned_sales_rep_id !== undefined) {
      updateData.assigned_sales_rep_id = orderData.assigned_sales_rep_id || null;
    }
    if (orderData.assigned_designer_id !== undefined) {
      updateData.assigned_designer_id = orderData.assigned_designer_id || null;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // Handle UUID validation errors
      if (error.message.includes('invalid input syntax for type uuid')) {
        if (error.message.includes('assigned_designer_id')) {
          throw new Error('Please select a valid designer');
        } else if (error.message.includes('assigned_sales_rep_id')) {
          throw new Error('Please select a valid sales representative');
        } else if (error.message.includes('apparel_type_id')) {
          throw new Error('Please select a valid apparel type');
        } else {
          throw new Error('Please ensure all fields are filled in correctly');
        }
      }
      // Handle foreign key constraint errors
      if (error.message.includes('foreign key')) {
        if (error.message.includes('designer')) {
          throw new Error('Please select a valid designer');
        } else if (error.message.includes('sales_rep')) {
          throw new Error('Please select a valid sales representative');
        } else if (error.message.includes('apparel_type')) {
          throw new Error('Please select a valid apparel type');
        }
      }
      throw error;
    }

    // Get the updated order with full details for notifications
    const updatedOrder = await getOrderById(id);

    try {
      if (orderData.status && orderData.status !== currentOrder.status) {
        await notifyAboutOrderStatusChange(
          currentOrder.customer_id,
          updatedOrder.order_number,
          orderData.status,
          updatedOrder.assigned_sales_rep_id
        );
      }

      if (orderData.assigned_designer_id && orderData.assigned_designer_id !== currentOrder.assigned_designer_id) {
        await notifyDesignerAboutAssignment(
          orderData.assigned_designer_id,
          updatedOrder.order_number
        );
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't throw here as the order update was successful
    }

    return updatedOrder;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const getOrderById = async (id: string): Promise<AdminOrder> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
        designer:employees!orders_assigned_designer_id_fkey(full_name)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      order_number: data.order_number,
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
      total_amount: data.total_amount,
     payment_status: data.payment_status,
      status: data.status,
      assigned_sales_rep_id: data.assigned_sales_rep_id,
      assigned_sales_rep_name: data.sales_rep?.full_name,
      assigned_designer_id: data.assigned_designer_id,
      assigned_designer_name: data.designer?.full_name,
      invoice_url: data.invoice_url,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw error;
  }
};

// Products CRUD Operations
export const getProducts = async (params: PaginationParams): Promise<PaginatedResponse<AdminProduct>> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        apparel_type:apparel_types(type_name)
      `, { count: 'exact' });

    // Apply search filter
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // Apply apparel type filter
    if (params.apparelTypeId) {
      query = query.eq('apparel_type_id', params.apparelTypeId);
    }

    // Apply status filter
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    // Apply price range filters
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
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const transformedData = (data || []).map(product => ({
      ...product,
      apparel_type_name: product.apparel_type?.type_name,
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const createProduct = async (productData: Partial<AdminProduct>): Promise<AdminProduct> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...productData,
        status: productData.status || 'active',
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<AdminProduct>): Promise<AdminProduct> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Apparel Types Operations
export const getApparelTypes = async (): Promise<ApparelType[]> => {
  try {
    const { data, error } = await supabase
      .from('apparel_types')
      .select('*')
      .order('type_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching apparel types:', error);
    return [];
  }
};

export const createApparelType = async (apparelTypeData: Partial<ApparelType>): Promise<ApparelType> => {
  try {
    const { data, error } = await supabase
      .from('apparel_types')
      .insert([apparelTypeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating apparel type:', error);
    throw error;
  }
};

// Sales Reps and Designers
export const getSalesReps = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'sales_rep')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sales reps:', error);
    return [];
  }
};

export const getDesigners = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'designer')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching designers:', error);
    return [];
  }
};

// Utility Functions
export const createNotification = async (
  userId: string,
  type: 'order' | 'user' | 'product' | 'system',
  message: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        message,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Invoice CRUD Operations
export const getInvoices = async (params: PaginationParams): Promise<PaginatedResponse<Invoice>> => {
  try {
    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(full_name, email)
      `, { count: 'exact' });

    // Apply search filter
    if (params.search) {
      // Handle customer-specific search (for customer dashboard)
      if (params.search.includes('customer_id.eq.')) {
        const [customerFilter, searchTerm] = params.search.split(',');
        const customerId = customerFilter.replace('customer_id.eq.', '');
        query = query.eq('customer_id', customerId);
        if (searchTerm) {
          query = query.ilike('invoice_title', `%${searchTerm}%`);
        }
      } else {
        query = query.or(`invoice_title.ilike.%${params.search}%,customer.full_name.ilike.%${params.search}%,customer.email.ilike.%${params.search}%`);
      }
    }

    // Apply status filter
    if (params.invoiceStatus) {
      query = query.eq('status', params.invoiceStatus);
    }


    // Apply month/year filter
    if (params.invoiceMonthYear) {
      query = query.eq('month_year', params.invoiceMonthYear);
    }

    // Apply date range filters
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const transformedData = (data || []).map(invoice => ({
      ...invoice,
      customer_name: invoice.customer?.full_name,
      customer_email: invoice.customer?.email,
    }));

    return {
      data: transformedData,
      total: count || 0,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil((count || 0) / params.limit),
    };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

export const createInvoice = async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) throw error;

    try {
      if (invoiceData.customer_id) {
        await notifyCustomerAboutInvoice(invoiceData.customer_id, invoiceData.invoice_title);
      }
    } catch (notificationError) {
      console.error('Error creating invoice notification:', notificationError);
    }

    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const updateInvoice = async (id: string, invoiceData: Partial<Invoice>): Promise<Invoice> => {
  try {
    // If order_ids are being updated, also update payment status of orders
    if (invoiceData.order_ids) {
      // First, get the current invoice to see which orders were previously included
      const { data: currentInvoice } = await supabase
        .from('invoices')
        .select('order_ids')
        .eq('id', id)
        .single();

      if (currentInvoice) {
        // Reset payment status of previously included orders to unpaid
        if (currentInvoice.order_ids && currentInvoice.order_ids.length > 0) {
          await supabase
            .from('orders')
            .update({ payment_status: 'unpaid' })
            .in('id', currentInvoice.order_ids);
        }

        // Set payment status of newly included orders based on invoice status
        if (invoiceData.order_ids.length > 0) {
          const paymentStatus = invoiceData.status === 'paid' ? 'paid' : 'unpaid';
          await supabase
            .from('orders')
            .update({ payment_status: paymentStatus })
            .in('id', invoiceData.order_ids);
        }
      }
    }

    // If only status is being updated to paid, update order payment status
    if (invoiceData.status === 'paid' && !invoiceData.order_ids) {
      // Get current invoice order_ids
      const { data: currentInvoice } = await supabase
        .from('invoices')
        .select('order_ids')
        .eq('id', id)
        .single();

      if (currentInvoice && currentInvoice.order_ids && currentInvoice.order_ids.length > 0) {
        await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .in('id', currentInvoice.order_ids);
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(invoiceData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

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
      customer_company_name: data.customer?.company_name,
    };
  } catch (error) {
    console.error('Error fetching invoice by ID:', error);
    throw error;
  }
};

export const getOrdersByIds = async (orderIds: string[]): Promise<AdminOrder[]> => {
  try {
    if (!orderIds || orderIds.length === 0) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name)
      `)
      .in('id', orderIds)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
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
      total_amount: order.total_amount,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: undefined,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: undefined,
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching orders by IDs:', error);
    return [];
  }
};

export const getAllCustomerOrders = async (customerId: string): Promise<AdminOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
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
      total_amount: order.total_amount,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: undefined,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: undefined,
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching all customer orders:', error);
    return [];
  }
};
export const getCustomersForInvoice = async (): Promise<{ id: string; full_name: string; email: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, email')
      .eq('status', 'active')
      .order('full_name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers for invoice:', error);
    return [];
  }
};

// Utility function to delete files from Supabase storage
export const deleteFileFromStorage = async (fileUrl: string, bucket: string): Promise<void> => {
  try {
    if (!fileUrl) return;

    if (bucket === 'product-images') {
      const urlParts = fileUrl.split('/');
      const s3Key = `product-images/${urlParts[urlParts.length - 1]}`;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-product-image?s3Key=${encodeURIComponent(s3Key)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error deleting file from S3');
      }
    } else {
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file from storage:', error);
      }
    }
  } catch (error) {
    console.error('Error processing file deletion:', error);
  }
};

export const getUnpaidOrdersForCustomer = async (
  customerId: string, 
  dateFrom?: string, 
  dateTo?: string
): Promise<AdminOrder[]> => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name)
      `)
      .eq('customer_id', customerId)
      .eq('payment_status', 'unpaid');

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
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
      total_amount: order.total_amount,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: undefined,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: undefined,
      invoice_url: order.invoice_url,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching unpaid orders for customer:', error);
    return [];
  }
};

// Notification Operations
export const getNotifications = async (userId: string, limit: number = 20): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const getNotificationsWithUnreadCount = async (userId: string, limit: number = 20): Promise<{ notifications: any[], unreadCount: number }> => {
  try {
    // Fetch notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (notificationsError) throw notificationsError;

    // Fetch unread count
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (countError) throw countError;

    return {
      notifications: notifications || [],
      unreadCount: unreadCount || 0
    };
  } catch (error) {
    console.error('Error fetching notifications with unread count:', error);
    return { notifications: [], unreadCount: 0 };
  }
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markNotificationAsUnread = async (notificationId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: false })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Helper function to get all admins
export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('role', 'admin')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    return [];
  }
};

// Customer Orders CRUD Operations (for customer dashboard)
export const getCustomerOrdersPaginated = async (params: PaginationParams & { customer_id: string }): Promise<PaginatedResponse<AdminOrder>> => {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(full_name, email, phone, company_name),
        product:products(title),
        apparel_type:apparel_types(type_name),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
        designer:employees!orders_assigned_designer_id_fkey(full_name)
      `, { count: 'exact' })
      .eq('customer_id', params.customer_id);

    // Apply search filter
    if (params.search) {
      query = query.or(`order_number.ilike.%${params.search}%,custom_description.ilike.%${params.search}%`);
    }

    // Apply status filter
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status);
      } else {
        query = query.eq('status', params.status);
      }
    }

    // Apply date range filters
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    // Apply sorting
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Fetch first attachment ID for each order
    const orderIds = (data || []).map(order => order.id);
    let firstAttachmentsMap: Record<string, string> = {};

    if (orderIds.length > 0) {
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
      } catch (attachmentError) {
        console.error('Error fetching attachments:', attachmentError);
      }
    }

    const transformedData = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      customer_id: order.customer_id,
      customer_name: order.customer?.full_name || 'Unknown',
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      customer_company_name: order.customer?.company_name || '',
      first_attachment_id: firstAttachmentsMap[order.id],
      product_id: order.product_id,
      product_title: order.product?.title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      apparel_type_id: order.apparel_type_id,
      apparel_type_name: order.apparel_type?.type_name,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      status: order.status,
      assigned_sales_rep_id: order.assigned_sales_rep_id,
      assigned_sales_rep_name: order.sales_rep?.full_name,
      assigned_designer_id: order.assigned_designer_id,
      assigned_designer_name: order.designer?.full_name,
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
    console.error('Error fetching customer orders:', error);
    throw error;
  }
};

// Order Comments Operations
export const getOrderComments = async (orderId: string): Promise<OrderComment[]> => {
  try {
    const { data, error } = await supabase
      .from('order_comments')
      .select(`
        *,
        author:employees!order_comments_author_id_fkey(full_name)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(comment => ({
      id: comment.id,
      order_id: comment.order_id,
      author_id: comment.author_id,
      author_name: comment.author?.full_name || 'Unknown',
      content: comment.content,
      created_at: comment.created_at,
    }));
  } catch (error) {
    console.error('Error fetching order comments:', error);
    return [];
  }
};

export const addOrderComment = async (orderId: string, authorId: string, content: string): Promise<OrderComment> => {
  try {
    const { data, error } = await supabase
      .from('order_comments')
      .insert([{
        order_id: orderId,
        author_id: authorId,
        content: content.trim(),
      }])
      .select(`
        *,
        author:employees!order_comments_author_id_fkey(full_name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      order_id: data.order_id,
      author_id: data.author_id,
      author_name: data.author?.full_name || 'Unknown',
      content: data.content,
      created_at: data.created_at,
    };
  } catch (error) {
    console.error('Error adding order comment:', error);
    throw error;
  }
};

// Re-export auth functions for use in admin components