import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a mock client when not using real Supabase
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
  if (!supabase) {
    // Mock response for development
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email,
          user_metadata: userData
        }
      }
    };
  }
  
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
  if (!supabase) {
    // Mock response for development
    return {
      data: {
        user: {
          id: 'mock-user-id',
          email
        }
      }
    };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) {
    // Mock response for development
    return;
  }
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  if (!supabase) {
    // Mock response for development
    return null;
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) {
    // Mock response for development
    return {
      id: userId,
      email: 'mock@example.com',
      full_name: 'Mock User',
      role: 'customer',
      is_active: true,
      notification_preferences: { email: true, push: true },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const createUserProfile = async (profile: Partial<UserProfile>) => {
  if (!supabase) {
    // Mock response for development
    return {
      id: 'mock-user-id',
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([profile])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};