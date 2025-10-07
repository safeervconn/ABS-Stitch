/**
 * Supabase Client Configuration
 * 
 * Centralized Supabase client setup with:
 * - Environment variable validation
 * - Optimized client configuration
 * - Error handling for missing credentials
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the dev server.');
}

// Initialize Supabase client with optimized configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey);