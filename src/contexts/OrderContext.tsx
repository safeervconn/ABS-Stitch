import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getCurrentUser, getUserProfile, supabase } from '../lib/supabase';

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  salesRep?: string;
  salesRepId?: string;
  designer?: string;
  designerId?: string;
  type: 'catalog' | 'custom';
  status: 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'delivered' | 'cancelled';
  amount: string;
  date: string;
  email: string;
  phone: string;
  designSize?: string;
  apparelType?: string;
  customWidth?: string;
  customHeight?: string;
  designInstructions?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (orderData: any) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignDesigner: (orderId: string, designerId: string, designerName: string) => void;
  getOrdersByRole: () => Order[];
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
  const [orders, setOrders] = useState<Order[]>([]);

  // Add new order
  const addOrder = async (orderData: any) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const profile = await getUserProfile(user.id);
      if (!profile) return;

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: `ORD-${Date.now()}`,
          customer_id: profile.id,
          order_type: orderData.type || 'custom',
          status: 'pending',
          total_amount: orderData.amount || 75.0,
          custom_instructions: orderData.designInstructions || '',
          design_requirements: {
            designSize: orderData.designSize || '',
            apparelType: orderData.apparelType || '',
            customWidth: orderData.customWidth || '',
            customHeight: orderData.customHeight || ''
          }
        })
        .select()
        .single();

      if (error) throw error;

      await fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  // Fetch orders with correct relationships
  const fetchOrders = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const profile = await getUserProfile(user.id);
      if (!profile) return;

      let query = supabase
        .from('orders')
        .select(`
          *,
          customer:customers(id, full_name, email, phone),
          sales_rep:employees!orders_assigned_sales_rep_id_fkey(id, full_name),
          designer:employees!orders_assigned_designer_id_fkey(id, full_name)
        `);

      switch (profile.role) {
        case 'customer':
          query = query.eq('customer_id', profile.id);
          break;
        case 'sales_rep':
          query = query.eq('assigned_sales_rep_id', profile.id);
          break;
        case 'designer':
          query = query.eq('assigned_designer_id', profile.id);
          break;
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const transformedOrders: Order[] = (data || []).map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.customer?.full_name || 'Unknown',
        customerId: order.customer_id,
        salesRep: order.sales_rep?.full_name,
        salesRepId: order.assigned_sales_rep_id,
        designer: order.designer?.full_name,
        designerId: order.assigned_designer_id,
        type: order.order_type,
        status: order.status,
        amount: `$${order.total_amount.toFixed(2)}`,
        date: new Date(order.created_at).toLocaleDateString(),
        email: order.customer?.email || '',
        phone: order.customer?.phone || '',
        designInstructions: order.custom_instructions,
        designSize: order.design_requirements?.designSize,
        apparelType: order.design_requirements?.apparelType,
        customWidth: order.design_requirements?.customWidth,
        customHeight: order.design_requirements?.customHeight,
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
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
        status: 'assigned'
      })
      .eq('id', orderId)
      .then(() => fetchOrders());
  };

  const getOrdersByRole = (): Order[] => orders;

  const value: OrderContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    assignDesigner,
    getOrdersByRole
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};
