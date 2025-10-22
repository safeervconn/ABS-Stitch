import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getCurrentUser, getUserProfile, supabase } from '../lib/supabase';
import { CustomerOrder } from '../admin/types';

interface OrderContextType {
  orders: CustomerOrder[];
  addOrder: (orderData: {
    order_type: 'custom' | 'stock_design';
    order_name: string;
    stock_design_id?: string;
    custom_description: string;
    total_amount: number;
    category_id?: string;
    custom_width?: number;
    custom_height?: number;
  }, files?: File[]) => Promise<any>;
  updateOrderStatus: (orderId: string, status: CustomerOrder['status']) => void;
  assignDesigner: (orderId: string, designerId: string, designerName: string) => void;
  getOrdersByRole: () => CustomerOrder[];
  fetchOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

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

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  // Add new order
  const addOrder = async (orderData: {
    order_type: 'custom' | 'stock_design';
    order_name: string;
    stock_design_id?: string;
    custom_description: string;
    total_amount: number;
    category_id?: string;
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

      // Create order without files - files will be uploaded separately via attachmentService
      const { data: newOrderData, error } = await supabase
        .from('orders')
        .insert({
          customer_id: profile.id,
          order_type: orderData.order_type,
          order_name: orderData.order_name,
          stock_design_id: orderData.stock_design_id || null,
          custom_description: orderData.custom_description,
          category_id: orderData.category_id || null,
          custom_width: orderData.custom_width || null,
          custom_height: orderData.custom_height || null,
          assigned_sales_rep_id: customerProfile.assigned_sales_rep_id,
          total_amount: orderData.total_amount,
          payment_status: 'unpaid',
          status: 'new',
        })
        .select()
        .single();

      if (error) throw error;

      try {
        const { notifyAboutNewOrder } = await import('../services/notificationService');
        const orderNumber = newOrderData.order_number || `ORD-${newOrderData.id.slice(0, 8)}`;

        await notifyAboutNewOrder(
          profile.id,
          profile.full_name,
          orderNumber,
          orderData.order_type,
          customerProfile.assigned_sales_rep_id
        );
      } catch (notificationError) {
        console.error('Error creating order notifications:', notificationError);
      }
      await fetchOrders();
      
      return newOrderData;
      
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  // Fetch orders with correct relationships
  const fetchOrders = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const profile = await getUserProfile(user.id);
    if (!profile) return;

    // Build fields dynamically in an array
    const selectParts = [
      "*",
      "customer:customers(id, full_name, email, phone, company_name)",
      "category:categories(category_name)"
    ];

    if (profile.role !== "customer") {
      selectParts.push(
        "sales_rep:employees!orders_assigned_sales_rep_id_fkey(id, full_name)",
        "designer:employees!orders_assigned_designer_id_fkey(id, full_name)"
      );
    }

    let query = supabase.from("orders").select(selectParts.join(", "));

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

    const transformedOrders: CustomerOrder[] = (data || []).map(order => ({
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
      order_name: order.order_name || 'No Order Name',
      customer_name: order.customer?.full_name || "Unknown",
      customer_email: order.customer?.email || "",
      customer_phone: order.customer?.phone || "",
      customer_company_name: order.customer?.company_name || "",
      customerId: order.customer_id,
      order_type: order.order_type || "custom",
      status: order.status,
      payment_status: order.payment_status || "unpaid",
      total_amount: order.total_amount || 0.0,
      created_at: order.created_at,
      updated_at: order.updated_at,
      custom_description: order.custom_description,
      category_id: order.category_id,
      category_name: order.category?.category_name,
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
};


  React.useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = (orderId: string, status: CustomerOrder['status']) => {
    supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .then(() => fetchOrders());
  };

  const assignDesigner = (orderId: string, designerId: string) => {
    supabase
      .from('orders')
      .update({
        assigned_designer_id: designerId,
        status: 'in_progress'
      })
      .eq('id', orderId)
      .then(() => fetchOrders());
  };

  const getOrdersByRole = (): CustomerOrder[] => orders;

  const value: OrderContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    assignDesigner,
    getOrdersByRole,
    fetchOrders,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};