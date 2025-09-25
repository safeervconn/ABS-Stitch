/**
 * Customer Dashboard Component
 * 
 * Purpose: Dashboard for customers to manage their orders and account
 * Features:
 * - Order history and tracking
 * - Account management
 * - Browse catalog and make purchases
 * - Communication with sales team
 * - Invoice and payment management
 * 
 * Access: Customer role only
 * Navigation: Accessible after customer login
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, CreditCard, LogOut, Bell, Plus, Eye, MessageCircle, Download, Package } from 'lucide-react';
import { signOut, getCurrentUser, getUserProfile } from '../lib/supabase';
import { useOrders } from '../contexts/OrderContext';
import OrderDetailsModal from '../components/OrderDetailsModal';
import PlaceOrderModal from '../components/PlaceOrderModal';

const CustomerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  
  const { getOrdersByRole, addOrder, addComment } = useOrders();
  const customerOrders = getOrdersByRole();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          if (profile && (profile.role === 'customer' || !profile.role)) {
            // Accept users without role (legacy) or with customer role
            setUser(profile);
          } else {
            console.error('Access denied: User role is', profile?.role);
            window.location.href = '/login';
          }
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error checking user:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = [
    { title: 'Total Orders', value: customerOrders.length.toString(), icon: ShoppingBag, color: 'blue' },
    { title: 'In Progress', value: customerOrders.filter(o => ['assigned', 'in_progress', 'review'].includes(o.status)).length.toString(), icon: Package, color: 'yellow' },
    { title: 'Completed', value: customerOrders.filter(o => ['completed', 'delivered'].includes(o.status)).length.toString(), icon: ShoppingBag, color: 'green' },
    { title: 'Total Spent', value: '$1,245', icon: CreditCard, color: 'purple' }
  ];

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handlePlaceOrder = (orderData: any) => {
    // Order handling is now done in the PlaceOrderModal component
    setIsPlaceOrderOpen(false);
  };

  const handleAddComment = (orderId: string, comment: string) => {
    // Comment functionality removed - implement if needed
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">1</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Customer'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'customer'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Customer'}!
          </h2>
          <p className="text-gray-600">Track your orders and manage your account.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={stat.title} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
                <button
                  onClick={() => setIsPlaceOrderOpen(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-semibold text-sm"
                >
                  Place Order
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {customerOrders.length > 0 ? customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">{order.order_type === 'custom' ? 'Custom Design' : 'Catalog Item'} • {order.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <p className="font-semibold text-gray-900">${order.total_amount?.toFixed(2) || '75.00'}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                    <button
                      onClick={() => setIsPlaceOrderOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold"
                    >
                      Place Your First Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => setIsPlaceOrderOpen(true)}
                className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all text-left shadow-sm"
              >
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">New Order</span>
              </button>
              <button 
                onClick={() => window.location.href = '/catalog'}
                className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all text-left shadow-sm"
              >
                <Eye className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Browse Catalog</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all text-left shadow-sm">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Contact Support</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-all text-left shadow-sm">
                <Download className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Download Files</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
      />

      {/* Place Order Modal */}
      <PlaceOrderModal
        isOpen={isPlaceOrderOpen}
        onClose={() => setIsPlaceOrderOpen(false)}
      />
    </div>
  );
};

export default CustomerDashboard;