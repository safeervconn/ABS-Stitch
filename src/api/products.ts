/**
 * Product Management API Functions
 * 
 * Product catalog operations including:
 * - Product fetching with filtering and sorting
 * - Apparel type management
 * - Search functionality
 * - Pagination support
 */

import { supabase } from './client';

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

export interface ApparelType {
  id: string;
  type_name: string;
  description?: string;
  created_at: string;
}

/**
 * Fetch products with advanced filtering, sorting, and pagination
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

    // Apply filtering
    if (filters?.apparelType && filters.apparelType !== 'All') {
      query = query.eq('apparel_type_id', filters.apparelType);
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
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
};

/**
 * Fetch apparel types for categorization
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
 * Fetch individual product by ID
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