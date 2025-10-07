/**
 * Admin API Functions
 * 
 * Administrative operations including:
 * - Dashboard statistics
 * - User management
 * - Notification system
 * - Role-based data access
 */

import { supabase } from './client';
import { AdminUser, AdminStats } from '../types';

/**
 * Get all admin users for notifications
 */
export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name, email')
      .eq('role', 'admin')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

/**
 * Create notification for user
 */
export const createNotification = async (
  userId: string,
  type: 'order' | 'user' | 'product' | 'system',
  message: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        message,
        read: false
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications with unread count for user
 */
export const getNotificationsWithUnreadCount = async (
  userId: string,
  limit: number = 20
): Promise<{ notifications: any[], unreadCount: number }> => {
  try {
    const [notificationsResult, unreadCountResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      
      supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('read', false)
    ]);

    return {
      notifications: notificationsResult.data || [],
      unreadCount: unreadCountResult.count || 0
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark notification as unread
 */
export const markNotificationAsUnread = async (notificationId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: false })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};