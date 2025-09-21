/**
 * Admin Dashboard Component
 * 
 * Purpose: Central dashboard for administrators to manage the entire system
 * Features:
 * - System overview and analytics
 * - User management (customers, sales reps, designers)
 * - Order management and assignment
 * - Product catalog management
 * - System settings and configuration
 * 
 * Access: Admin role only
 * Navigation: Accessible after admin login
 */

import React, { useState, useEffect } from 'react';
import { Shield, Users, ShoppingBag, DollarSign, LogOut, Bell, Eye, UserPlus, Package } from 'lucide-react';
import { signOut, getCurrentUser, getUserProfile } from '../lib/supabase';
import { useOrders } from '../contexts/OrderContext';
import OrderDetailsModal from '../components/OrderDetailsModal';
import Navbar from '../components/Navbar';

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  
  const { getOrdersByRole, assignDesigner, updateOrderStatus, addComment } = useOrders();
  const allOrders = getOrdersByRole();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          if (profile && profile.role === 'admin') {
            setUser(profile);
          } else {
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
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration - in real app, fetch from database
  const stats = [
    { title: 'Total Customers', value: '156', change: '+12', icon: Users, color: 'blue' },
    { title: 'In-Progress Orders', value: allOrders.filter(o => ['assigned', 'in_progress', 'review'].includes(o.status)).length.toString(), change: '+5', icon: ShoppingBag, color: 'yellow' },
    { title: 'Total Revenue', value: '$24,580', change: '+18%', icon: DollarSign, color: 'green' },
    { title: 'Active Products', value: '89', change: '+3', icon: Package, color: 'purple' }
  ];

  // Mock designers data
  const availableDesigners = [
    { id: 'designer-001', name: 'Jane Designer' },
    { id: 'designer-002', name: 'Alex Creative' },
    { id: 'designer-003', name: 'Sam Artist' }
  ];

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleAssignDesigner = (orderId: string, designerId: string) => {
    const designer = availableDesigners.find(d => d.id === designerId);
    if (designer) {
      assignDesigner(orderId, designerId, designer.name);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
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
      {/* Navigation */}
      <Navbar />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-red-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Admin'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'admin'}</p>
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
            Welcome, {user?.full_name?.split(' ')[0] || 'Admin'}!
          </h2>
          <p className="text-gray-600">Manage your business operations and monitor system performance.</p>
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
                  <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Orders Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">All Orders</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {allOrders.length > 0 ? allOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{order.customer} • {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.amount}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {/* Designer Assignment Dropdown */}
                    {order.status === 'pending' && (
                      <select
                        onChange={(e) => handleAssignDesigner(order.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>Assign Designer</option>
                        {availableDesigners.map(designer => (
                          <option key={designer.id} value={designer.id}>
                            {designer.name}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {/* Status Update Dropdown */}
                    {['assigned', 'in_progress', 'review'].includes(order.status) && (
                      <select
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        defaultValue={order.status}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                    
                    {order.designer && (
                      <div className="text-xs text-gray-500">
                        <p>Designer:</p>
                        <p className="font-medium">{order.designer}</p>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              )}
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
    </div>
  );
};

export default AdminDashboard;