import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getCurrentUser, getUserProfile, supabase } from '../lib/supabase';
import { CustomerOrder } from '../admin/types';

interface OrderContextType {
  orders: CustomerOrder[];
  addOrder: (order: any, files?: File[]) => Promise<void>;
  updateOrderStatus: (orderId: string, status: CustomerOrder['status']) => void;
  assignDesigner: (orderId: string, designerId: string, designerName: string) => void;
  getOrdersByRole: () => CustomerOrder[];
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
  const addOrder = async (formData: any, files?: File[]) => {
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

      // Calculate total amount based on order type and specifications
      let totalAmount = 75.00; // Default for custom orders
      if (formData.order_type === 'catalog' && formData.product_id) {
        // For catalog orders, you might want to fetch the product price
        totalAmount = 50.00; // Placeholder - should fetch from products table
      }

      const { data: orderData, error } = await supabase
        .from('orders')
        .insert({
          customer_id: profile.id,
          order_type: formData.order_type || 'custom',
          custom_description: formData.designInstructions || '',
          design_size: formData.designSize,
          apparel_type: formData.apparelType,
          custom_width: formData.customWidth ? parseFloat(formData.customWidth) : null,
          custom_height: formData.customHeight ? parseFloat(formData.customHeight) : null,
          file_urls: fileUrls.length > 0 ? fileUrls : null,
          total_amount: totalAmount,
          payment_status: 'unpaid',
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

    // Build fields dynamically in an array
    const selectParts = [
      "*",
      "customer:customers(id, full_name, email, phone, company_name)"
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
      customer_name: order.customer?.full_name || "Unknown",
      customer_email: order.customer?.email || "",
      customer_phone: order.customer?.phone || "",
      customer_company_name: order.customer?.company_name || "",
      customerId: order.customer_id,
      order_type: order.order_type || "custom",
      file_urls: order.file_urls || (order.file_url ? [order.file_url] : null),
      status: order.status,
      payment_status: order.payment_status || "unpaid",
      total_amount: order.total_amount || 75.0,
      date: new Date(order.created_at).toLocaleDateString(),
      custom_description: order.custom_description,
      design_size: order.design_size,
      apparel_type: order.apparel_type,
      custom_width: order.custom_width,
      custom_height: order.custom_height,
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
        status: 'assigned'
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
    getOrdersByRole
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};