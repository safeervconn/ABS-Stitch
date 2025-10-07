/**
 * Order Management API Functions
 * 
 * Order operations including:
 * - Order creation and updates
 * - File upload handling
 * - Comment system
 * - Status management
 */

import { supabase } from './client';
import { OrderComment } from '../types';

/**
 * Get order comments for order details
 */
export const getOrderComments = async (orderId: string): Promise<OrderComment[]> => {
  try {
    const { data, error } = await supabase
      .from('order_comments')
      .select(`
        *,
        author:employees(full_name)
      `)
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(comment => ({
      ...comment,
      author_name: comment.author?.full_name || 'Unknown'
    }));
  } catch (error) {
    console.error('Error fetching order comments:', error);
    throw error;
  }
};

/**
 * Add comment to order
 */
export const addOrderComment = async (
  orderId: string,
  authorId: string,
  content: string
): Promise<OrderComment> => {
  try {
    const { data, error } = await supabase
      .from('order_comments')
      .insert([{
        order_id: orderId,
        author_id: authorId,
        content
      }])
      .select(`
        *,
        author:employees(full_name)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      author_name: data.author?.full_name || 'Unknown'
    };
  } catch (error) {
    console.error('Error adding order comment:', error);
    throw error;
  }
};

/**
 * Upload file to Supabase storage
 */
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from Supabase storage
 */
export const deleteFileFromStorage = async (fileUrl: string): Promise<void> => {
  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const bucket = pathParts[pathParts.length - 2];
    const fileName = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};