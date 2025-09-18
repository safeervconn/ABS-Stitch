import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sales_rep' | 'designer' | 'customer';
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  company_name?: string;
  billing_address?: any;
  assigned_sales_rep?: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  original_price?: number;
  image_url?: string;
  tags?: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  sales_rep_id?: string;
  assigned_designer_id?: string;
  order_type: 'catalog' | 'custom';
  status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'delivered' | 'cancelled';
  total_amount: number;
  custom_instructions?: string;
  design_requirements?: any;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const signUp = async (email: string, password: string, userData: {
  full_name: string;
  role?: 'customer' | 'sales_rep' | 'designer';
  phone?: string;
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: undefined // Disable email confirmation
    }
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

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createUserProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get dashboard route based on user role
export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'sales_rep':
      return '/sales/dashboard';
    case 'designer':
      return '/designer/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/';
  }
};
// Create demo users for testing
export const createDemoUsers = async () => {
  const demoUsers = [
    {
      email: 'admin@gmail.com',
      password: 'SecureAdmin123!',
      full_name: 'System Administrator',
      role: 'admin' as const
    },
    {
      email: 'sales@gmail.com',
      password: 'SecureSales123!',
      full_name: 'John Sales',
      role: 'sales_rep' as const
    },
    {
      email: 'designer@gmail.com',
      password: 'SecureDesign123!',
      full_name: 'Jane Designer',
      role: 'designer' as const
    },
    {
      email: 'customer@gmail.com',
      password: 'SecureCustomer123!',
      full_name: 'Sarah Johnson',
      role: 'customer' as const
    }
  ];

  console.log('Demo user credentials:');
  console.log('Admin: admin@gmail.com / SecureAdmin123!');
  console.log('Sales Rep: sales@gmail.com / SecureSales123!');
  console.log('Designer: designer@gmail.com / SecureDesign123!');
  console.log('Customer: customer@gmail.com / SecureCustomer123!');
  
  for (const user of demoUsers) {
    try {
      const { data, error } = await signUp(user.email, user.password, {
        full_name: user.full_name,
        role: user.role
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          console.log(`✓ ${user.role} already exists: ${user.email}`);
        } else {
          console.error(`Error creating ${user.role}:`, error.message);
        }
      } else {
        console.log(`✓ Created ${user.role}: ${user.email}`);
        
        // Wait for user creation to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create user profile if user was created successfully
        if (data.user) {
          try {
            await createUserProfile({
              id: data.user.id,
              email: user.email,
              full_name: user.full_name,
              role: user.role,
              is_active: true,
              notification_preferences: { email: true, push: true }
            });
            
            // Create role-specific records
            if (user.role === 'customer') {
              await supabase.from('customers').insert({
                id: data.user.id,
                total_orders: 0,
                total_spent: 0
              });
            } else if (user.role === 'sales_rep') {
              await supabase.from('sales_reps').insert({
                id: data.user.id,
                employee_id: `SR${Date.now()}`,
                department: 'Sales',
                commission_rate: 10.0,
                total_sales: 0,
                active_customers: 0
              });
            } else if (user.role === 'designer') {
              await supabase.from('designers').insert({
                id: data.user.id,
                employee_id: `DS${Date.now()}`,
                specialties: ['Embroidery', 'Custom Stitching'],
                hourly_rate: 50.0,
                total_completed: 0,
                average_rating: 0
              });
            }
            
            console.log(`✓ Created profile for ${user.role}`);
          } catch (profileError) {
            console.error(`Error creating profile for ${user.role}:`, profileError);
          }
        }
      }
    } catch (error) {
      console.error(`Error creating ${user.role}:`, error);
    }
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
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true);

  // Apply filters
  if (filters?.category && filters.category !== 'All') {
    query = query.eq('category', filters.category);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
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
  
  if (error) throw error;
  return data;
};

export const getProductCategories = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('is_active', true);
  
  if (error) throw error;
  
  const categories = [...new Set(data.map(item => item.category))];
  return ['All', ...categories];
};

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();
  
  if (error) throw error;
  return data;
};