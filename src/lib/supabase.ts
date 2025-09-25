import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the dev server.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'sales_rep' | 'designer';
  status: 'active' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  status: 'active' | 'disabled';
  assigned_sales_rep_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  image_url?: string;
  price: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  product_id?: string;
  custom_description?: string;
  file_url?: string;
  status: 'pending' | 'unassigned' | 'assigned_to_sales' | 'assigned_to_designer' | 'in_progress' | 'under_review' | 'completed' | 'archived';
  assigned_sales_rep_id?: string;
  assigned_designer_id?: string;
  invoice_url?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderComment {
  id: number;
  order_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface OrderLog {
  id: number;
  order_id: string;
  action: string;
  performed_by?: string;
  details?: any;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: string;
  type: 'order' | 'user' | 'product' | 'system';
  message: string;
  read: boolean;
  created_at: string;
}

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string): Promise<Employee | Customer | null> => {
  // First try employees table
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (employee) {
    return { ...employee, role: employee.role as Employee['role'] };
  }
  
  // Then try customers table
  const { data: customer, error: custError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (customer) {
    return { ...customer, role: 'customer' };
  }
  
  return null;
};

// Create customer profile (used only during signup)
export const createCustomerProfile = async (customerData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  status: string;
  company_name?: string;
}) => {
  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Create employee profile (used only by admin via dashboard or create-admin script)
export const createEmployeeProfile = async (employeeData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'sales_rep' | 'designer';
  status: string;
}) => {
  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get dashboard route based on user role
export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'sales_rep':
      return '/sales/dashboard';
    case 'designer':
      return '/designer/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return null; // Return null for invalid roles
  }
};

// Product database functions
export const getProducts = async (filters?: {
  category?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) => {
  // let query = supabase
  //   .from('products')
  //   .select(`
  //     *,
  //     category:categories(name)
  //   `)
  //   .eq('status', 'active');
  let query = supabase
  .from('products')
  .select(`
    *,
    category:categories(name)
  `)
  .eq('status', 'active');


  // Apply filters
  if (filters?.category && filters.category !== 'All') {
    query = query.eq('categories.name', filters.category);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case 'price-low':
      query = query.order('price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('price', { ascending: false });
      break;
    case 'title':
      query = query.order('title', { ascending: true });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data;
};

export const getProductCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('name')
    .order('name');
  
  if (error) {
    console.error('Error fetching categories:', error);
    return ['All'];
  }
  
  const categories = data.map(item => item.name);
  return ['All', ...categories];
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name)
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  return data;
};