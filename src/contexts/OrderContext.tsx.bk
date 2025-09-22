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

  const addOrder = async (orderData: any) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;
      
      const profile = await getUserProfile(user.id);
      if (!profile) return;

      // Create order in database
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: `ORD-${Date.now()}`,
          customer_id: profile.id,
          order_type: 'custom',
          status: 'pending',
          total_amount: 75.00,
          custom_instructions: orderData.designInstructions,
          design_requirements: {
            designSize: orderData.designSize,
            apparelType: orderData.apparelType,
            customWidth: orderData.customWidth,
            customHeight: orderData.customHeight
          }
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh orders list
      await fetchOrders();
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

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
    customer:customers!inner(
      customers!customers_id_fkey(full_name, email, phone)
    ),
    sales_rep:sales_reps(
      customers!sales_reps_id_fkey(full_name)
    ),
    designer:designers(
      customers!designers_id_fkey(full_name)
    )
  `);

      // Apply role-based filtering
      switch (profile.role) {
        case 'customer':
          query = query.eq('customer_id', profile.id);
          break;
        case 'sales_rep':
          query = query.eq('sales_rep_id', profile.id);
          break;
        case 'designer':
          query = query.eq('assigned_designer_id', profile.id);
          break;
        // Admin sees all orders
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match Order interface
      const transformedOrders: Order[] = (data || []).map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.customer?.customers?.full_name || 'Unknown',
        customerId: order.customer_id,
        salesRep: order.sales_rep?.employees?.full_name,
        salesRepId: order.sales_rep_id,
        designer: order.designer?.employees?.full_name,
        designerId: order.assigned_designer_id,
        type: order.order_type,
        status: order.status,
        amount: `$${order.total_amount.toFixed(2)}`,
        date: new Date(order.created_at).toLocaleDateString(),
        email: order.customer?.customers?.email || '',
        phone: order.customer?.customers?.phone || '',
        designInstructions: order.custom_instructions,
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
    // Update in database and refresh
    supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .then(() => fetchOrders());
  };

  const assignDesigner = (orderId: string, designerId: string, designerName: string) => {
    // Update in database and refresh
    supabase
      .from('orders')
      .update({ 
        assigned_designer_id: designerId,
        status: 'assigned'
      })
      .eq('id', orderId)
      .then(() => fetchOrders());
  };

  const getOrdersByRole = (): Order[] => {
    return orders; // Orders are already filtered by role in fetchOrders
  };

  const value: OrderContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    assignDesigner,
    getOrdersByRole
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};