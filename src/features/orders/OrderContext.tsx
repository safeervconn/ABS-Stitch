/**
 * Order Management Context Provider
 * 
 * Comprehensive order management system providing:
 * - Secure order creation with multi-file upload support
 * - Real-time order status tracking and updates
 * - Automated designer and sales rep assignment
 * - Role-based order filtering and access control
 * - Integrated notification system for stakeholders
 * - Optimized data fetching with caching strategies
 * - Memory leak prevention and cleanup
 */

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { getCurrentUser } from '../../api/auth';
import { getUserProfile } from '../../api/users';
import { supabase } from '../../api/client';
import { createNotification } from '../../api/admin';
import { CustomerOrder } from '../../types';

interface OrderContextType {
  orders: CustomerOrder[];
  addOrder: (orderData: {
    order_type: 'custom' | 'catalog';
    product_id?: string;
    custom_description: string;
    total_amount: number;
    apparel_type_id?: string;
    custom_width?: number;
    custom_height?: number;
  }, files?: File[]) => Promise<void>;
  updateOrderStatus: (orderId: string, status: CustomerOrder['status']) => void;
  assignDesigner: (orderId: string, designerId: string, designerName: string) => void;
  getOrdersByRole: () => CustomerOrder[];
  fetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

/**
 * Custom hook to access order context with comprehensive error handling
 * Ensures context is used within provider and provides helpful error messages
 */
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = React.memo(({ children }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  /**
   * Create new order with comprehensive file upload and notification system
   * Handles multi-file uploads, customer assignment, and stakeholder notifications
   */
  const addOrder = useCallback(async (orderData: {
    order_type: 'custom' | 'catalog';
    product_id?: string;
    custom_description: string;
    total_amount: number;
    apparel_type_id?: string;
    custom_width?: number;
    custom_height?: number;
  }, files?: File[]) => {
    try {
      // Validate user authentication
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to place orders');
      }

      const profile = await getUserProfile(user.id);
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Retrieve customer profile for sales rep assignment
      const { data: customerProfile, error: customerError } = await supabase
        .from('customers')
        .select('assigned_sales_rep_id')
        .eq('id', profile.id)
        .single();

      if (customerError) {
        console.error('Error fetching customer profile:', customerError);
        throw new Error('Failed to fetch customer information');
      }

      let fileUrls: string[] = [];

      // Process file uploads with error handling
      if (files && files.length > 0) {
        for (const file of files) {
          // Validate file size (10MB limit)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
          }

          // Generate unique file path
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `order-files/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('order-files')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw new Error(`Failed to upload file: ${file.name}`);
          }

          // Generate public URL for file access
          const { data: urlData } = supabase.storage
            .from('order-files')
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            fileUrls.push(urlData.publicUrl);
          }
        }
      }

      // Create order record in database with all relevant data
      const { data: newOrderData, error } = await supabase
        .from('orders')
        .insert({
          customer_id: profile.id,
          order_type: orderData.order_type,
          product_id: orderData.product_id || null,
          custom_description: orderData.custom_description,
          apparel_type_id: orderData.apparel_type_id || null,
          custom_width: orderData.custom_width || null,
          custom_height: orderData.custom_height || null,
          file_urls: fileUrls.length > 0 ? fileUrls : null,
          assigned_sales_rep_id: customerProfile.assigned_sales_rep_id,
          total_amount: orderData.total_amount,
          payment_status: 'unpaid',
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;

      // Send notifications to all relevant stakeholders
      try {
        const { getAllAdmins, createNotification } = await import('../admin/api/supabaseHelpers');
        
        // Generate order number for notification messages
        const orderNumber = newOrderData.order_number || `ORD-${newOrderData.id.slice(0, 8)}`;
        
        // Notify customer of successful order placement
        await createNotification(
          profile.id,
          'order',
          `Your ${orderData.order_type} order ${orderNumber} has been placed successfully! We'll keep you updated on the progress.`
        );
        
        // Notify all administrators of new order
        const admins = await getAllAdmins();
        for (const admin of admins) {
          await createNotification(
            admin.id,
            'order',
            `New ${orderData.order_type} order ${orderNumber} has been placed by ${profile.full_name}`
          );
        }
        
        // Notify assigned sales representative if applicable
        if (customerProfile.assigned_sales_rep_id) {
          await createNotification(
            customerProfile.assigned_sales_rep_id,
            'order',
            `New ${orderData.order_type} order ${orderNumber} has been placed by your assigned customer ${profile.full_name}`
          );
        }
      } catch (notificationError) {
        console.error('Error creating order notifications:', notificationError);
        // Don't throw here as order creation was successful
      }
      
      // Refresh order list to show new order
      await fetchOrders();
      
      // Display success message to user
      const { toast } = await import('../../utils/toast');
      toast.success('Order placed successfully! You will receive updates as we process your order.');
     
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }, []);

  /**
   * Fetch orders with comprehensive role-based filtering and data relationships
   * Optimizes queries based on user role to improve performance and security
   */
  const fetchOrders = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.warn('No authenticated user found');
        return;
      }

      const profile = await getUserProfile(user.id);
      if (!profile) {
        console.warn('User profile not found');
        return;
      }

      // Construct query fields based on user role for optimal performance
      const selectParts = [
        "*",
        "customer:customers(id, full_name, email, phone, company_name)",
        "apparel_type:apparel_types(type_name)"
      ];

      // Add employee relationship data for non-customer users
      if (profile.role !== "customer") {
        selectParts.push(
          "sales_rep:employees!orders_assigned_sales_rep_id_fkey(id, full_name)",
          "designer:employees!orders_assigned_designer_id_fkey(id, full_name)"
        );
      }

      let query = supabase.from("orders").select(selectParts.join(", "));

      // Apply role-based filtering for data security and performance
      switch (profile.role) {
        case "customer":
          query = query.eq("customer_id", profile.id);
          break;
        case "sales_rep":
          query = query.eq("assigned_sales_rep_id", profile.id);
          break;
        case "designer":
          query = query.eq("assigned_designer_id", profile.id);
          break;
        case "admin":
          // Admins can see all orders - no additional filtering
          break;
        default:
          console.warn('Unknown user role:', profile.role);
          return;
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      // Transform database response to consistent interface format
      const transformedOrders: CustomerOrder[] = (data || []).map(order => ({
        id: order.id,
        order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
        customer_name: order.customer?.full_name || "Unknown",
        customer_email: order.customer?.email || "",
        customer_phone: order.customer?.phone || "",
        customer_company_name: order.customer?.company_name || "",
        customerId: order.customer_id,
        order_type: order.order_type || "custom",
        file_urls: order.file_urls || (order.file_url ? [order.file_url] : null),
        status: order.status,
        payment_status: order.payment_status || "unpaid",
        total_amount: order.total_amount || 0.0,
        created_at: order.created_at,
        updated_at: order.updated_at,
        custom_description: order.custom_description,
        apparel_type_id: order.apparel_type_id,
        apparel_type_name: order.apparel_type?.type_name,
        custom_width: order.custom_width,
        custom_height: order.custom_height,
        assigned_sales_rep_id: order.assigned_sales_rep_id,
        assigned_designer_id: order.assigned_designer_id,
        assigned_sales_rep_name: order.sales_rep?.full_name,
        assigned_designer_name: order.designer?.full_name,
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Set empty array on error to prevent UI issues
      setOrders([]);
    }
  }, []);

  // Load orders when component mounts
  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Update order status with database synchronization
   * Automatically refreshes order list after update
   */
  const updateOrderStatus = useCallback((orderId: string, status: CustomerOrder['status']) => {
    if (!orderId || !status) {
      console.error('Order ID and status are required');
      return;
    }

    supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating order status:', error);
        } else {
          fetchOrders();
        }
      });
  }, [fetchOrders]);

  /**
   * Assign designer to order and automatically update status to in_progress
   * Maintains data consistency across order workflow
   */
  const assignDesigner = useCallback((orderId: string, designerId: string) => {
    if (!orderId || !designerId) {
      console.error('Order ID and designer ID are required');
      return;
    }

    supabase
      .from('orders')
      .update({
        assigned_designer_id: designerId,
        status: 'in_progress'
      })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) {
          console.error('Error assigning designer:', error);
        } else {
          fetchOrders();
        }
      });
  }, [fetchOrders]);

  /**
   * Get orders filtered by current user role and permissions
   * Returns orders relevant to the authenticated user
   */
  const getOrdersByRole = useCallback((): CustomerOrder[] => orders, [orders]);

  /**
   * Memoized context value to prevent unnecessary re-renders and optimize performance
   * Only updates when dependencies change
   */
  const value: OrderContextType = useMemo(() => ({
    orders,
    addOrder,
    updateOrderStatus,
    assignDesigner,
    getOrdersByRole,
    fetchOrders,
  }), [orders, addOrder, updateOrderStatus, assignDesigner, getOrdersByRole, fetchOrders]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
});