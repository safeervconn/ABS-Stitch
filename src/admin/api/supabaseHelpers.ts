import { supabase } from '../../lib/supabase';
import { AdminUser, AdminOrder, AdminProduct, Category, AdminStats, AdminMeta, PaginatedResponse, PaginationParams } from '../types';

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
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')
      .gte('created_at', startOfMonth.toISOString());

    // Total revenue this month
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfMonth.toISOString());

    const totalRevenueThisMonth = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // In-progress orders
    const { count: inProgressOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['assigned', 'in_progress', 'review']);

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
        customer:customers!inner(
          user_profiles!customers_id_fkey(full_name, email)
        ),
        sales_rep:sales_reps(
          user_profiles!sales_reps_id_fkey(full_name)
        ),
        designer:designers(
          user_profiles!designers_id_fkey(full_name)
        ),
        order_items(quantity, unit_price, product_id, products(title))
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      customer_name: order.customer?.user_profiles?.full_name || 'Unknown',
      customer_email: order.customer?.user_profiles?.email || '',
      sales_rep_id: order.sales_rep_id,
      sales_rep_name: order.sales_rep?.user_profiles?.full_name,
      assigned_designer_id: order.assigned_designer_id,
      designer_name: order.designer?.user_profiles?.full_name,
      assigned_role: order.assigned_role,
      order_type: order.order_type,
      status: order.status,
      total_amount: order.total_amount,
      items_summary: order.order_items?.map((item: any) => item.products?.title).join(', ') || 'Custom Order',
      quantity: order.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1,
      created_at: order.created_at,
      updated_at: order.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
};

// Users CRUD Operations
export const getUsers = async (params: PaginationParams): Promise<PaginatedResponse<AdminUser>> => {
  try {
    let query = supabase
      .from('user_profiles')
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

    // Apply sales rep filter
    if (params.salesRepId) {
      // This would require a join with customers table to filter by assigned sales rep
      // For now, we'll implement a basic version
      query = query.eq('id', params.salesRepId);
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
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{
        ...userData,
        id: crypto.randomUUID(), // Generate UUID for user
        status: userData.status || 'active',
      }])
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity('create', 'user', data.id, { user_data: userData });

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await logActivity('update', 'user', id, { user_data: userData });

    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log activity
    await logActivity('delete', 'user', id);
  } catch (error) {
    console.error('Error deleting user:', error);
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
        customer:customers!inner(
          user_profiles!customers_id_fkey(full_name, email)
        ),
        sales_rep:sales_reps(
          user_profiles!sales_reps_id_fkey(full_name)
        ),
        designer:designers(
          user_profiles!designers_id_fkey(full_name)
        ),
        order_items(quantity, unit_price, product_id, products(title))
      `, { count: 'exact' });

    // Apply search filter
    if (params.search) {
      query = query.or(`order_number.ilike.%${params.search}%`);
    }

    // Apply status filter
    if (params.status) {
      query = query.eq('status', params.status);
    }

    // Apply customer search filter
    if (params.customerSearch) {
      query = query.or(`customer.user_profiles.full_name.ilike.%${params.customerSearch}%,customer.user_profiles.email.ilike.%${params.customerSearch}%`);
    }

    // Apply date range filters
    if (params.dateFrom) {
      query = query.gte('created_at', params.dateFrom);
    }
    if (params.dateTo) {
      query = query.lte('created_at', params.dateTo);
    }

    // Apply amount range filters
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
    const from = (params.page - 1) * params.limit;
    const to = from + params.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    const transformedData = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number,
      customer_id: order.customer_id,
      customer_name: order.customer?.user_profiles?.full_name || 'Unknown',
      customer_email: order.customer?.user_profiles?.email || '',
      sales_rep_id: order.sales_rep_id,
      sales_rep_name: order.sales_rep?.user_profiles?.full_name,
      assigned_designer_id: order.assigned_designer_id,
      designer_name: order.designer?.user_profiles?.full_name,
      assigned_role: order.assigned_role,
      order_type: order.order_type,
      status: order.status,
      total_amount: order.total_amount,
      items_summary: order.order_items?.map((item: any) => item.products?.title).join(', ') || 'Custom Order',
      quantity: order.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1,
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
        sales_rep_id: orderData.sales_rep_id,
        assigned_designer_id: orderData.assigned_designer_id,
        assigned_role: orderData.assigned_role,
        status: orderData.status,
        total_amount: orderData.total_amount,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create notification for assigned user
    if (orderData.sales_rep_id || orderData.assigned_designer_id) {
      const assignedUserId = orderData.sales_rep_id || orderData.assigned_designer_id;
      await createNotification(assignedUserId!, 'Order Assigned', `Order ${data.order_number} has been assigned to you.`, id);
    }

    // Log activity
    await logActivity('update', 'order', id, { order_data: orderData });

    // Return transformed data
    const transformedOrder = await getOrderById(id);
    return transformedOrder;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export getOrderById = async (id: string): Promise<AdminOrder> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customer:customers!inner(
          user_profiles!customers_id_fkey(full_name, email)
        ),
        sales_rep:sales_reps(
          user_profiles!sales_reps_id_fkey(full_name)
        ),
        designer:designers(
          user_profiles!designers_id_fkey(full_name)
        ),
        order_items(quantity, unit_price, product_id, products(title))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      order_number: data.order_number,
      customer_id: data.customer_id,
      customer_name: data.customer?.user_profiles?.full_name || 'Unknown',
      customer_email: data.customer?.user_profiles?.email || '',
      sales_rep_id: data.sales_rep_id,
      sales_rep_name: data.sales_rep?.user_profiles?.full_name,
      assigned_designer_id: data.assigned_designer_id,
      designer_name: data.designer?.user_profiles?.full_name,
      assigned_role: data.assigned_role,
      order_type: data.order_type,
      status: data.status,
      total_amount: data.total_amount,
      items_summary: data.order_items?.map((item: any) => item.products?.title).join(', ') || 'Custom Order',
      quantity: data.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 1,
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
      query = query.or(`title.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
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

    // Log activity
    await logActivity('create', 'product', data.id, { product_data: productData });

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

    // Log activity
    await logActivity('update', 'product', id, { product_data: productData });

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

    // Log activity
    await logActivity('delete', 'product', id);
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
      .from('user_profiles')
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
      .from('user_profiles')
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

// Admin Meta Operations
export const getAdminMeta = async (): Promise<AdminMeta | null> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return null;
    
    const { data, error } = await supabase
      .from('admin_meta')
      .select('*') 
      .eq('admin_id', user.data.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data;
  } catch (error) {
    console.error('Error fetching admin meta:', error);
    return null;
  }
};

export const updateLastSeen = async (tabName: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('update_admin_last_seen', { tab_name: tabName });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating last seen:', error);
  }
};

// Badge Counts
export const getBadgeCounts = async (): Promise<{ users: number; orders: number; products: number }> => {
  try {
    // Implement proper badge counting with admin meta tracking
    const adminMeta = await getAdminMeta();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const lastSeenUsers = adminMeta?.last_seen_users || oneDayAgo;
    const lastSeenOrders = adminMeta?.last_seen_orders || oneDayAgo;
    const lastSeenProducts = adminMeta?.last_seen_products || oneDayAgo;
    
    const [usersCount, ordersCount, productsCount] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastSeenUsers),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastSeenOrders),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastSeenProducts),
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
export const logActivity = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_admin_activity', {
      action_name: action,
      resource_type_name: resourceType,
      resource_id_param: resourceId,
      details_param: details,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  relatedOrderId?: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title,
        message,
        type: 'info',
        related_order_id: relatedOrderId,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const getProducts = async (filters?: {
  category?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
 }) => {
  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'active');