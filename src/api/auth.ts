/**
 * Authentication API Functions
 * 
 * Centralized authentication operations including:
 * - User registration and login
 * - Profile creation for customers and employees
 * - Account status validation
 * - Role-based access control
 * - Password reset functionality
 */

import { supabase } from './client';

/**
 * Create new user account with comprehensive error handling
 */
export const signUp = async (email: string, password: string) => {
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
 * Authenticate user with enhanced error handling
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
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Retrieve currently authenticated user
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Enhanced authentication with account status validation
 */
export const signInWithStatusCheck = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  if (data.user) {
    const { getUserProfile } = await import('./users');
    const profile = await getUserProfile(data.user.id);
    if (profile && 'status' in profile && profile.status === 'disabled') {
      await supabase.auth.signOut();
      throw new Error('Your account is currently inactive and will be activated by an administrator after review.');
    }
  }
  
  return data;
};

/**
 * Determine appropriate dashboard route based on user role
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
      return null;
  }
};