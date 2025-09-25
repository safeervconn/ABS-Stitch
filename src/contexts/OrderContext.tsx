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
  file_urls?: string[];
  designSize?: string;
  apparelType?: string;
  customWidth?: string;
  customHeight?: string;
  designInstructions?: string;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: any, files?: File[]) => Promise<void>;
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
  const addOrder = async (order: any, files?: File[]) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const profile = await getUserProfile(user.id);
      if (!profile) return;

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

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_id: profile.id,
          custom_description: order.designInstructions || '',
          file_url: fileUrls.length > 0 ? fileUrls[0] : null, // Store first file URL for compatibility
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      await fetchOrders();
      
      // Show success message
      alert('Order placed successfully!');
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
        file_urls: order.file_url ? [order.file_url] : [],
        status: order.status,
        amount: `$75.00`, // Default amount for custom orders
        date: new Date(order.created_at).toLocaleDateString(),
        email: order.customer?.email || '',
        phone: order.customer?.phone || '',
        designInstructions: order.custom_description,
        designSize: order.designSize,
        apparelType: order.apparelType,
        customWidth: order.customWidth,
        customHeight: order.customHeight,
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