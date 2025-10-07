/**
 * Supabase API Integration
 * 
 * Centralized database and authentication service providing:
 * - Optimized Supabase client configuration with error handling
 * - Secure authentication workflows with status validation
 * - User profile management with role-based access
 * - Product catalog operations with caching
 * - Type-safe database entity definitions
 * - Notification system integration
 * - Performance-optimized queries
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables validation with detailed error messaging
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the dev server.');
}

// Initialize Supabase client with optimized configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Comprehensive database type definitions for type safety
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

export interface ApparelType {
  id: string;
  type_name: string;
  description?: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  apparel_type_id?: string;
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
  status: 'in_progress' | 'under_review' | 'completed' | 'cancelled';
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

/**
 * Create new user account with comprehensive error handling
 * Validates email format and password strength before submission
 */
export const signUp = async (email: string, password: string) => {
  // Basic validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

/**
 * Authenticate user with enhanced error handling and validation
 * Provides specific error messages for common authentication issues
 */
export const signIn = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

/**
 * Sign out current user with session cleanup
 * Ensures complete session termination for security
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Retrieve currently authenticated user with error handling
 * Returns null if no user is authenticated
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Fetch user profile with role detection and caching
 * Searches both employees and customers tables for comprehensive user data
 */
export const getUserProfile = async (userId: string): Promise<Employee | Customer | null> => {
  if (!userId) {
    throw new Error('User ID is required');
  }

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

/**
 * Create customer profile with notification system integration
 * Automatically notifies administrators of new customer registrations
 */
export const createCustomerProfile = async (customerData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  status: string;
  company_name?: string;
}) => {
  // Validate required fields
  if (!customerData.id || !customerData.email || !customerData.full_name) {
    throw new Error('ID, email, and full name are required');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single();
  
  if (error) throw error;
  
  // Notify administrators about new customer registration
  try {
    const { getAllAdmins, createNotification } = await import('../admin/api/supabaseHelpers');
    const admins = await getAllAdmins();
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'user',
        `New customer ${customerData.full_name} has signed up`
      );
    }
  } catch (notificationError) {
    console.error('Error creating customer signup notifications:', notificationError);
    // Don't throw here as customer creation was successful
  }
  
  return data;
};

/**
 * Create employee profile with administrative privileges
 * Used by administrators to create new employee accounts
 */
export const createEmployeeProfile = async (employeeData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'sales_rep' | 'designer';
  status: string;
}) => {
  // Validate required fields and role
  if (!employeeData.id || !employeeData.email || !employeeData.full_name || !employeeData.role) {
    throw new Error('ID, email, full name, and role are required');
  }

  const validRoles = ['admin', 'sales_rep', 'designer'];
  if (!validRoles.includes(employeeData.role)) {
    throw new Error('Invalid role specified');
  }

  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Create employee profile for self-registration
 * Always creates account with disabled status pending admin approval
 */
export const createEmployeeProfileSelfSignup = async (employeeData: {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'sales_rep' | 'designer';
}) => {
  // Validate self-signup restrictions
  const allowedRoles = ['sales_rep', 'designer'];
  if (!allowedRoles.includes(employeeData.role)) {
    throw new Error('Self-signup is only allowed for sales representatives and designers');
  }

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      ...employeeData,
      status: 'disabled' // Always disabled pending admin approval
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  // Notify administrators about new employee self-registration
  try {
    const { getAllAdmins, createNotification } = await import('../admin/api/supabaseHelpers');
    const admins = await getAllAdmins();
    for (const admin of admins) {
      await createNotification(
        admin.id,
        'user',
        `New employee ${employeeData.full_name} has signed up (${employeeData.role.replace('_', ' ')}) - pending approval`
      );
    }
  } catch (notificationError) {
    console.error('Error creating employee signup notifications:', notificationError);
    // Don't throw here as employee creation was successful
  }
  
  return data;
};

/**
 * Enhanced authentication with account status validation
 * Prevents disabled accounts from accessing the system
 */
export const signInWithStatusCheck = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  if (data.user) {
    // Validate account status before allowing access
    const profile = await getUserProfile(data.user.id);
    if (profile && 'status' in profile && profile.status === 'disabled') {
      // Immediately sign out disabled accounts
      await supabase.auth.signOut();
      throw new Error('Your account is currently inactive and will be activated by an administrator after review.');
    }
  }
  
  return data;
};

/**
 * Determine appropriate dashboard route based on user role
 * Provides role-based navigation for authenticated users
 */
export const getDashboardRoute = (role: string): string | null => {
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
      return null; // Invalid role
  }
};

/**
 * Fetch products with advanced filtering, sorting, and pagination
 * Optimized for catalog display with comprehensive search capabilities
 */
export const getProducts = async (filters?: {
  apparelType?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
  let query = supabase
    .from('products')
    .select(`
      *,
      apparel_type:apparel_types(type_name)
    `)
    .eq('status', 'active');

    // Apply filtering based on provided criteria
  if (filters?.apparelType && filters.apparelType !== 'All') {
    query = query.eq('apparel_type_id', filters.apparelType);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

    // Apply sorting with fallback to creation date
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

    // Apply pagination if specified
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
      throw error;
  }
  return data;
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
};

/**
 * Fetch apparel types for product categorization and filtering
 * Used in product forms and catalog filtering
 */
export const getApparelTypes = async () => {
  try {
  const { data, error } = await supabase
    .from('apparel_types')
    .select('id, type_name')
    .order('type_name');
  
  if (error) {
    console.error('Error fetching apparel types:', error);
      throw error;
  }
  
  return data || [];
  } catch (error) {
    console.error('Error in getApparelTypes:', error);
    return [];
  }
};

/**
 * Fetch individual product by ID with related data
 * Used for product detail views and order processing
 */
export const getProductById = async (id: string) => {
  if (!id) {
    throw new Error('Product ID is required');
  }

  try {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      apparel_type:apparel_types(type_name)
    `)
    .eq('id', id)
    .eq('status', 'active')
    .single();
  
  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
  return data;
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
};