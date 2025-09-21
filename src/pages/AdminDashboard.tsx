/**
 * Admin Dashboard Component
 * 
 * Purpose: Central management dashboard for administrators
 * Features:
 * - System overview and analytics
 * - User management (customers, sales reps, designers)
 * - Order management and assignment
 * - Product catalog management
 * - Performance metrics and reporting
 * 
 * Access: Admin role only
 * Navigation: Accessible after admin login
 */

import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, Package, LogOut, Bell, UserPlus, Settings, Eye, BarChart3 } from 'lucide-react';
import { signOut, getCurrentUser, getUserProfile, supabase } from '../lib/supabase';
import { useOrders } from '../contexts/OrderContext';
import OrderDetailsModal from '../components/OrderDetailsModal';

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [stats, setStats] = useState([
    { title: 'Total Customers', value: '0', change: '+0', icon: Users, color: 'blue' },
    { title: 'New Customers', value: '0', change: '+0', icon: UserPlus, color: 'green' },
    { title: 'In-Progress Orders', value: '0', change: '+0', icon: ShoppingBag, color: 'yellow' },
    { title: 'Monthly Revenue', value: '$0', change: '+$0', icon: DollarSign, color: 'purple' },
    { title: 'Active Products', value: '0', change: '+0', icon: Package, color: 'indigo' }
  ]);
  
  const { getOrdersByRole, assignDesigner, updateOrderStatus } = useOrders();
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

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setStatsLoading(true);
      try {
        // Get current month start and end dates
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        // Previous month for comparison
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        // 1. Total Customers
        const { count: totalCustomers } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        // 2. New Customers this month
        const { count: newCustomersThisMonth } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentMonthStart.toISOString())
          .lte('created_at', currentMonthEnd.toISOString());

        // Previous month new customers for comparison
        const { count: newCustomersPrevMonth } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', prevMonthStart.toISOString())
          .lte('created_at', prevMonthEnd.toISOString());

        // 3. In-Progress Orders (not completed, delivered, or cancelled)
        const { count: inProgressOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .not('status', 'in', '(completed,delivered,cancelled)');

        // Previous count for comparison (approximate)
        const { count: prevInProgressOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .not('status', 'in', '(completed,delivered,cancelled)')
          .lt('created_at', currentMonthStart.toISOString());

        // 4. Total Revenue this month
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', currentMonthStart.toISOString())
          .lte('created_at', currentMonthEnd.toISOString());

        const currentMonthRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        // Previous month revenue for comparison
        const { data: prevRevenueData } = await supabase
          .from('orders')
          .select('total_amount')
          .gte('created_at', prevMonthStart.toISOString())
          .lte('created_at', prevMonthEnd.toISOString());

        const prevMonthRevenue = prevRevenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        // 5. Active Products
        const { count: activeProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Calculate changes
        const customerChange = newCustomersThisMonth - (newCustomersPrevMonth || 0);
        const orderChange = inProgressOrders - (prevInProgressOrders || 0);
        const revenueChange = currentMonthRevenue - prevMonthRevenue;

        // Update stats
        setStats([
          { 
            title: 'Total Customers', 
            value: (totalCustomers || 0).toString(), 
            change: customerChange > 0 ? `+${customerChange}` : customerChange.toString(), 
            icon: Users, 
            color: 'blue' 
          },
          { 
            title: 'New Customers', 
            value: (newCustomersThisMonth || 0).toString(), 
            change: customerChange > 0 ? `+${customerChange}` : customerChange.toString(), 
            icon: UserPlus, 
            color: 'green' 
          },
          { 
            title: 'In-Progress Orders', 
            value: (inProgressOrders || 0).toString(), 
            change: orderChange > 0 ? `+${orderChange}` : orderChange.toString(), 
            icon: ShoppingBag, 
            color: 'yellow' 
          },
          { 
            title: 'Monthly Revenue', 
            value: `$${currentMonthRevenue.toFixed(2)}`, 
            change: revenueChange > 0 ? `+$${revenueChange.toFixed(2)}` : `$${revenueChange.toFixed(2)}`, 
            icon: DollarSign, 
            color: 'purple' 
          },
          { 
            title: 'Active Products', 
            value: (activeProducts || 0).toString(), 
            change: '+0', // Products don't change frequently, so showing neutral
            icon: Package, 
            color: 'indigo' 
          }
        ]);

      } catch (error) {
        console.error('Error fetching stats:', error);
        // Keep default values if there's an error
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

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

  // Mock designers data for assignment
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
                <BarChart3 className="h-6 w-6 text-blue-600" />
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
            Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}!
          </h2>
          <p className="text-gray-600">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  {statsLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 
                      stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {statsLoading ? '...' : stat.value}
                </h3>
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
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {allOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
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
                      {!['completed', 'delivered', 'cancelled'].includes(order.status) && (
                        <select
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          defaultValue={order.status}
                        >
                          <option value="pending">Pending</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="completed">Completed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                      
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all text-left shadow-sm">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Add User</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all text-left shadow-sm">
                <Package className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Add Product</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all text-left shadow-sm">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">View Reports</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-all text-left shadow-sm">
                <Settings className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">System Settings</span>
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
    </div>
  );
};

export default AdminDashboard;