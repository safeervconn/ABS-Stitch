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
      data: userData
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

// Initialize demo users in Supabase
export const initializeDemoUsers = async () => {
  const demoUsers = [
    {
      email: 'admin@absstitch.com',
      password: 'demo123',
      full_name: 'System Administrator',
      role: 'admin' as const
    },
    {
      email: 'sales@absstitch.com',
      password: 'demo123',
      full_name: 'John Sales',
      role: 'sales_rep' as const
    },
    {
      email: 'designer@absstitch.com',
      password: 'demo123',
      full_name: 'Jane Designer',
      role: 'designer' as const
    },
    {
      email: 'customer@absstitch.com',
      password: 'demo123',
      full_name: 'Sarah Johnson',
      role: 'customer' as const
    }
  ];

  for (const user of demoUsers) {
    try {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!existingProfile) {
        // Sign up the user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.full_name,
              role: user.role
            }
          }
        });

        if (signUpError) {
          console.error(`Error creating user ${user.email}:`, signUpError);
          continue;
        }

        if (authData.user) {
          // Create user profile
          await createUserProfile({
            id: authData.user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            is_active: true,
            notification_preferences: { email: true, push: true }
          });

          // Create role-specific records
          if (user.role === 'customer') {
            await supabase.from('customers').insert({
              id: authData.user.id,
              total_orders: 0,
              total_spent: 0
            });
          } else if (user.role === 'sales_rep') {
            await supabase.from('sales_reps').insert({
              id: authData.user.id,
              employee_id: 'SR001',
              department: 'Sales',
              commission_rate: 10.0,
              total_sales: 0,
              active_customers: 0
            });
          } else if (user.role === 'designer') {
            await supabase.from('designers').insert({
              id: authData.user.id,
              employee_id: 'DS001',
              specialties: ['Embroidery', 'Logo Stitching'],
              hourly_rate: 50.0,
              total_completed: 0,
              average_rating: 0
            });
          }

          console.log(`Demo user created: ${user.email}`);
        }
      } else {
        console.log(`Demo user already exists: ${user.email}`);
      }
    } catch (error) {
      console.error(`Error processing user ${user.email}:`, error);
    }
  }
};