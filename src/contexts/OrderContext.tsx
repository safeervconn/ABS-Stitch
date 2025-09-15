import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getTempCurrentUser } from '../lib/auth';

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
  comments: Array<{
    id: string;
    author: string;
    authorId: string;
    text: string;
    date: string;
  }>;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (orderData: any) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  assignDesigner: (orderId: string, designerId: string, designerName: string) => void;
  addComment: (orderId: string, comment: string) => void;
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
  // Mock orders data - in a real app, this would come from a database
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-20250101',
      customer: 'Sarah Johnson',
      customerId: 'customer-001',
      salesRep: 'John Sales',
      salesRepId: 'sales-001',
      designer: 'Jane Designer',
      designerId: 'designer-001',
      type: 'custom',
      status: 'in_progress',
      amount: '$85',
      date: '2 days ago',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      designSize: 'large',
      apparelType: 't-shirt',
      designInstructions: 'I need a modern logo design for my fitness brand. The design should be bold and energetic with blue and orange colors.',
      comments: [
        {
          id: '1',
          author: 'Sarah Johnson',
          authorId: 'customer-001',
          text: 'Looking forward to seeing the initial concepts!',
          date: '1 day ago'
        }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-20250102',
      customer: 'Mike Chen',
      customerId: 'customer-002',
      salesRep: 'John Sales',
      salesRepId: 'sales-001',
      type: 'custom',
      status: 'pending',
      amount: '$150',
      date: '1 week ago',
      email: 'mike@techcompany.com',
      phone: '+1 (555) 987-6543',
      designSize: 'medium',
      apparelType: 'jacket',
      designInstructions: 'Corporate logo design for tech startup. Clean, professional, minimalist style preferred.',
      comments: []
    },
    {
      id: '3',
      orderNumber: 'ORD-20250103',
      customer: 'Emily Rodriguez',
      customerId: 'customer-003',
      salesRep: 'John Sales',
      salesRepId: 'sales-001',
      designer: 'Jane Designer',
      designerId: 'designer-001',
      type: 'custom',
      status: 'completed',
      amount: '$120',
      date: '2 weeks ago',
      email: 'emily@localbusiness.com',
      phone: '+1 (555) 456-7890',
      designSize: 'small',
      apparelType: 'cap',
      designInstructions: 'Marketing materials for local restaurant. Warm, inviting colors.',
      comments: [
        {
          id: '2',
          author: 'Jane Designer',
          authorId: 'designer-001',
          text: 'Initial designs are ready for review.',
          date: '1 week ago'
        },
        {
          id: '3',
          author: 'Emily Rodriguez',
          authorId: 'customer-003',
          text: 'Looks perfect! Thank you.',
          date: '1 week ago'
        }
      ]
    }
  ]);

  const addOrder = (orderData: any) => {
    const currentUser = getTempCurrentUser();
    if (!currentUser) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      orderNumber: `ORD-${Date.now()}`,
      customer: currentUser.full_name,
      customerId: currentUser.id,
      type: 'custom',
      status: 'pending',
      amount: '$75', // Default amount - would be calculated based on requirements
      date: 'Just now',
      email: orderData.email,
      phone: `${orderData.countryCode} ${orderData.phoneNumber}`,
      designSize: orderData.designSize,
      apparelType: orderData.apparelType,
      customWidth: orderData.customWidth,
      customHeight: orderData.customHeight,
      designInstructions: orderData.designInstructions,
      comments: []
    };

    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const assignDesigner = (orderId: string, designerId: string, designerName: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, designerId, designer: designerName, status: 'assigned' }
        : order
    ));
  };

  const addComment = (orderId: string, comment: string) => {
    const currentUser = getTempCurrentUser();
    if (!currentUser) return;

    const newComment = {
      id: Date.now().toString(),
      author: currentUser.full_name,
      authorId: currentUser.id,
      text: comment,
      date: 'Just now'
    };

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, comments: [...order.comments, newComment] }
        : order
    ));
  };

  const getOrdersByRole = (): Order[] => {
    const currentUser = getTempCurrentUser();
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'admin':
        return orders;
      case 'sales_rep':
        return orders.filter(order => order.salesRepId === currentUser.id);
      case 'designer':
        return orders.filter(order => order.designerId === currentUser.id);
      case 'customer':
        return orders.filter(order => order.customerId === currentUser.id);
      default:
        return [];
    }
  };

  const value: OrderContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    assignDesigner,
    addComment,
    getOrdersByRole
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};