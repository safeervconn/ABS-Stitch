import { supabase } from '../../lib/supabase';
import { AdminUser, AdminCustomer, AdminOrder, AdminProduct, Category, AdminStats, PaginatedResponse, PaginationParams } from '../types';

// Admin Stats Queries
export const getAdminStats = async (): Promise<AdminStats> => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  try {
    // Total orders this month
    const { count: totalOrdersThisMonth } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // New customers this month
    const { count: newCustomersThisMonth } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Total revenue this month (assuming orders have a price field or we calculate from products)
    const { data: revenueData } = await supabase
      .from('orders')
      .select(`
        products(price)
      `)
      .gte('created_at', startOfMonth.toISOString());

    const totalRevenueThisMonth = revenueData?.reduce((sum, order) => {
      return sum + (order.products?.price || 75); // Default price for custom orders
    }, 0) || 0;

    // In-progress orders
    const { count: inProgressOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['assigned_to_sales', 'assigned_to_designer', 'in_progress', 'under_review']);

    // Active products
    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    return {
      totalOrdersThisMonth: totalOrdersThisMonth || 0,
      newCustomersThisMonth: newCustomersThisMonth || 0,
      totalRevenueThisMonth,
      inProgressOrders: inProgressOrders || 0,
      activeProducts: activeProducts || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      totalOrdersThisMonth: 0,
      newCustomersThisMonth: 0,
      totalRevenueThisMonth: 0,
      inProgressOrders: 0,
      activeProducts: 0,
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
        customer:customers!inner(full_name, email),
        product:products(title),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
        designer:employees!orders_assigned_designer_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    //   return (data || []).map(order => ({
    //   id: order.id,
    //   customer_id: order.customer_id,
    //   customer_name: order.customer?.full_name || 'Unknown',
    //   customer_email: order.customer?.email || '',
    //   product_id: order.product_id,
    //   product_title: order.product?.title,
    //   custom_description: order.custom_description,
    //   file_url: order.file_url,
    //   status: order.status,
    //   assigned_sales_rep_id: order.assigned_sales_rep_id,
    //   assigned_sales_rep_name: order.sales_rep?.full_name,
    //   assigned_designer_id: order.assigned_designer_id,
    //   assigned_designer_name: order.designer?.full_name,
    //   invoice_url: order.invoice_url,
    //   created_at: order.created_at,
    //   updated_at: order.updated_at,
    // }));

    return (data || []).map(order => ({
  id: order.id,
  orderNumber: order.order_number,
  customer: order.customer?.full_name || 'Unknown',
  customerId: order.customer_id,
  salesRep: order.sales_rep?.full_name,
  salesRepId: order.assigned_sales_rep_id,
  designer: order.designer?.full_name,
  designerId: order.assigned_designer_id,
  type: order.order_type,
  file_urls: order.file_url ? [order.file_url] : [],
  status: order.status,
  amount: `$75.00`, // or use actual amount if stored
  date: new Date(order.created_at).toLocaleDateString(),
  email: order.customer?.email || '',
  phone: order.customer?.phone || '',
  designInstructions: order.custom_description,
  designSize: order.designSize,
  apparelType: order.apparelType,
  customWidth: order.customWidth,
  customHeight: order.customHeight,
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
      query = query.eq('status', params.status);
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

// Customers CRUD Operations
export const getCustomers = async (params: PaginationParams): Promise<PaginatedResponse<AdminCustomer>> => {
  try {
    let query = supabase
      .from('customers')
      .select(`
        *,
        sales_rep:employees!customers_assigned_sales_rep_id_fkey(full_name)
      `, { count: 'exact' });

    // Apply search filter
    if (params.search) {
      query = query.or(`full_name.ilike.%${params.search}%,email.ilike.%${params.search}%`);
    }

    // Apply status filter
    if (params.status) {
      query = query.eq('status', params.status);
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
        customer:customers!inner(full_name, email),
        product:products(title),
        sales_rep:employees!orders_assigned_sales_rep_id_fkey(full_name),
        designer:employees!orders_assigned_designer_id_fkey(full_name)
      `, { count: 'exact' });

    // Apply search filter
    if (params.search) {
      query = query.ilike('id', `%${params.search}%`);
    }

    // Apply status filter
    if (params.status) {
      query = query.eq('status', params.status);
    }

    // Apply customer search filter
    if (params.customerSearch) {
      query = query.or(`customer.full_name.ilike.%${params.customerSearch}%,customer.email.ilike.%${params.customerSearch}%`);
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

    const transformedData = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      order_type: order.order_type,
      customer_id: order.customer_id,
      customer_name: order.customer?.full_name || 'Unknown',
      customer_email: order.customer?.email || '',
      product_id: order.product_id,
      product_title: order.product?.title,
      custom_description: order.custom_description,
      file_urls: order.file_urls,
      design_size: order.design_size,
      apparel_type: order.apparel_type,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
      total_amount: order.total_amount,
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
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrder = async (id: string, orderData: Partial<AdminOrder>): Promise<AdminOrder> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        order_type: orderData.order_type,
        design_size: orderData.design_size,
        apparel_type: orderData.apparel_type,
        custom_width: orderData.custom_width,
        custom_height: orderData.custom_height,
        total_amount: orderData.total_amount,
        assigned_sales_rep_id: orderData.assigned_sales_rep_id,
        assigned_designer_id: orderData.assigned_designer_id,
        status: orderData.status,
        invoice_url: orderData.invoice_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for assigned user
    if (orderData.assigned_sales_rep_id || orderData.assigned_designer_id) {
      const assignedUserId = orderData.assigned_sales_rep_id || orderData.assigned_designer_id;
      await createNotification(assignedUserId!, 'order', `Order ${id} has been assigned to you.`);
    }

    // Log the activity
    await logOrderActivity(id, 'updated', data);

    return await getOrderById(id);
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
        customer:customers!inner(full_name, email),
        product:products(title),
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
      product_id: data.product_id,
      product_title: data.product?.title,
      custom_description: data.custom_description,
      file_urls: data.file_urls,
      design_size: data.design_size,
      apparel_type: data.apparel_type,
      custom_width: data.custom_width,
      custom_height: data.custom_height,
      total_amount: data.total_amount,
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
        category:categories(name)
      `, { count: 'exact' });

    // Apply search filter
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // Apply category filter
    if (params.categoryId) {
      query = query.eq('category_id', params.categoryId);
    }

    // Apply status filter
    if (params.status) {
      query = query.eq('status', params.status);
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
      category_name: product.category?.name,
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

// Categories Operations
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
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

// Badge Counts (simplified without admin_meta table)
export const getBadgeCounts = async (): Promise<{ users: number; orders: number; products: number }> => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const [usersCount, ordersCount, productsCount] = await Promise.all([
      supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', oneDayAgo),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', oneDayAgo),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', oneDayAgo),
    ]);
    
    return {
      users: usersCount.count || 0,
      orders: ordersCount.count || 0,
      products: productsCount.count || 0,
    };
  } catch (error) {
    console.error('Error fetching badge counts:', error);
    return { users: 0, orders: 0, products: 0 };
  }
};

// Utility Functions
export const logOrderActivity = async (
  orderId: string,
  action: string,
  details?: any
): Promise<void> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { error } = await supabase
      .from('order_logs')
      .insert([{
        order_id: orderId,
        action,
        performed_by: user.data.user.id,
        details,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging order activity:', error);
  }
};

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