/**
 * Order Management Context Provider
 * 
 * Global state management for orders including:
 * - Order creation with file upload support
 * - Order status updates and tracking
 * - Designer assignment functionality
 * - Role-based order filtering
 * - Notification system integration
 * - Optimized data fetching and caching
 */

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { getCurrentUser, getUserProfile, supabase } from '../../core/api/supabase';
import { createNotification } from '../admin/api/supabaseHelpers';
import { CustomerOrder } from '../admin/types';

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
 * Hook to access order context with error handling
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
   * Add new order with file upload and notification system
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
      const user = await getCurrentUser();
      if (!user) return;

      const profile = await getUserProfile(user.id);
      if (!profile) return;

      // Fetch customer profile to get assigned sales rep
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

      // Upload files if provided
      if (files && files.length > 0) {
        for (const file of files) {
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

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('order-files')
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            fileUrls.push(urlData.publicUrl);
          }
        }
      }

      // Create order in database
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

      // Create notifications for new order
      try {
        const { getAllAdmins, createNotification } = await import('../admin/api/supabaseHelpers');
        
        // Get order number for notifications
        const orderNumber = newOrderData.order_number || `ORD-${newOrderData.id.slice(0, 8)}`;
        
        // Notify the customer who placed the order
        await createNotification(
          profile.id,
          'order',
          `Your ${orderData.order_type} order ${orderNumber} has been placed successfully! We'll keep you updated on the progress.`
        );
        
        // Notify all admins
        const admins = await getAllAdmins();
        for (const admin of admins) {
          await createNotification(
            admin.id,
            'order',
            `New ${orderData.order_type} order ${orderNumber} has been placed by ${profile.full_name}`
          );
        }
        
        // Notify assigned sales rep if exists
        if (customerProfile.assigned_sales_rep_id) {
          await createNotification(
            customerProfile.assigned_sales_rep_id,
            'order',
            `New ${orderData.order_type} order ${orderNumber} has been placed by your assigned customer ${profile.full_name}`
          );
        }
      } catch (notificationError) {
        console.error('Error creating order notifications:', notificationError);
        // Don't throw here as the order was created successfully
      }
      
      await fetchOrders();
      
      // Show success toast for customer
      const { toast } = await import('../../core/utils/toast');
      toast.success('Order placed successfully! You will receive updates as we process your order.');
     
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }, []);

  /**
   * Fetch orders with role-based filtering and proper relationships
   */
  const fetchOrders = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const profile = await getUserProfile(user.id);
      if (!profile) return;

      // Build fields dynamically based on user role
      const selectParts = [
        "*",
        "customer:customers(id, full_name, email, phone, company_name)",
        "apparel_type:apparel_types(type_name)"
      ];

      if (profile.role !== "customer") {
        selectParts.push(
          "sales_rep:employees!orders_assigned_sales_rep_id_fkey(id, full_name)",
          "designer:employees!orders_assigned_designer_id_fkey(id, full_name)"
        );
      }

      let query = supabase.from("orders").select(selectParts.join(", "));

      // Apply role-based filtering
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
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      // Transform data to consistent format
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
    }
  }, []);

  // Load orders on mount
  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * Update order status in database
   */
  const updateOrderStatus = useCallback((orderId: string, status: CustomerOrder['status']) => {
    supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .then(() => fetchOrders());
  }, [fetchOrders]);

  /**
   * Assign designer to order and update status
   */
  const assignDesigner = useCallback((orderId: string, designerId: string) => {
    supabase
      .from('orders')
      .update({
        assigned_designer_id: designerId,
        status: 'in_progress'
      })
      .eq('id', orderId)
      .then(() => fetchOrders());
  }, [fetchOrders]);

  /**
   * Get orders filtered by current user role
   */
  const getOrdersByRole = useCallback((): CustomerOrder[] => orders, [orders]);

  /**
   * Memoized context value to prevent unnecessary re-renders
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