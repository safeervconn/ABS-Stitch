/**
 * Admin Dashboard Component
 * 
 * Purpose: Comprehensive dashboard for administrators to manage the entire system
 * Features:
 * - System overview with real-time metrics
 * - User management with full CRUD operations
 * - Product catalog management
 * - Order management with assignment capabilities
 * - Profile settings and notifications
 * 
 * Access: Admin role only
 * Navigation: Tabbed interface with quick actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, ShoppingBag, TrendingUp, Settings, LogOut, Bell, BarChart3, 
  UserCheck, Package, Eye, Edit, Trash2, Plus, Filter, Search, 
  Calendar, User, Mail, Phone, Building, Save, AlertCircle, X,
  ChevronDown, ChevronUp, UserPlus, PackagePlus, ShoppingCart
} from 'lucide-react';
import { signOut, getCurrentUser, getUserProfile, supabase } from '../lib/supabase';
import OrderDetailsModal from '../components/OrderDetailsModal';

const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  
  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [salesReps, setSalesReps] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  
  // Filter states
  const [userFilter, setUserFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderCustomerFilter, setOrderCustomerFilter] = useState('');
  const [orderSalesRepFilter, setOrderSalesRepFilter] = useState('');
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Loading states
  const [dataLoading, setDataLoading] = useState(false);

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

  // Fetch all data functions
  const fetchUsers = useCallback(async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          customers(company_name),
          sales_reps(employee_id, department),
          designers(employee_id, specialties)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setDataLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers!inner(
            user_profiles!customers_id_fkey(full_name, email)
          ),
          sales_rep:sales_reps(
            user_profiles!sales_reps_id_fkey(full_name)
          ),
          designer:designers(
            user_profiles!designers_id_fkey(full_name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const transformedOrders = (data || []).map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.customer?.user_profiles?.full_name || 'Unknown',
        customerId: order.customer_id,
        salesRep: order.sales_rep?.user_profiles?.full_name,
        salesRepId: order.sales_rep_id,
        designer: order.designer?.user_profiles?.full_name,
        designerId: order.assigned_designer_id,
        type: order.order_type,
        status: order.status,
        amount: `$${order.total_amount.toFixed(2)}`,
        date: new Date(order.created_at).toLocaleDateString(),
        email: order.customer?.user_profiles?.email || '',
        designInstructions: order.custom_instructions,
        created_at: order.created_at
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const fetchSalesRepsAndDesigners = useCallback(async () => {
    try {
      const [salesRepsData, designersData] = await Promise.all([
        supabase
          .from('sales_reps')
          .select('id, user_profiles!sales_reps_id_fkey(full_name)'),
        supabase
          .from('designers')
          .select('id, user_profiles!designers_id_fkey(full_name)')
      ]);
      
      setSalesReps(salesRepsData.data || []);
      setDesigners(designersData.data || []);
    } catch (error) {
      console.error('Error fetching sales reps and designers:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchProducts();
      fetchOrders();
      fetchSalesRepsAndDesigners();
    }
  }, [user, fetchUsers, fetchProducts, fetchOrders, fetchSalesRepsAndDesigners]);

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

  // Calculate real-time stats
  const stats = [
    { 
      title: 'Total Users', 
      value: users.length.toString(), 
      change: `+${users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length}`, 
      icon: Users, 
      color: 'blue' 
    },
    { 
      title: 'Active Orders', 
      value: orders.filter(o => !['completed', 'delivered', 'cancelled'].includes(o.status)).length.toString(), 
      change: `+${orders.filter(o => new Date(o.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length}`, 
      icon: ShoppingBag, 
      color: 'green' 
    },
    { 
      title: 'Total Products', 
      value: products.length.toString(), 
      change: `+${products.filter(p => new Date(p.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length}`, 
      icon: Package, 
      color: 'purple' 
    },
    { 
      title: 'Active Products', 
      value: products.filter(p => p.is_active).length.toString(), 
      change: `${Math.round((products.filter(p => p.is_active).length / products.length) * 100) || 0}%`, 
      icon: TrendingUp, 
      color: 'orange' 
    }
  ];

  // Event handlers
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) throw error;
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleEditProduct = (product: any) => {
    setEditProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);
        
        if (error) throw error;
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleAssignOrder = async (orderId: string, assigneeId: string, assigneeType: 'sales_rep' | 'designer') => {
    try {
      const updateData = assigneeType === 'sales_rep' 
        ? { sales_rep_id: assigneeId, status: 'assigned' }
        : { assigned_designer_id: assigneeId, status: 'assigned' };
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error assigning order:', error);
      alert('Failed to assign order');
    }
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

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesRole = userFilter === 'all' || user.role === userFilter;
    const matchesSearch = userSearch === '' || 
      user.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredProducts = products.filter(product => {
    const matchesStatus = productFilter === 'all' || 
      (productFilter === 'active' && product.is_active) ||
      (productFilter === 'inactive' && !product.is_active);
    const matchesSearch = productSearch === '' ||
      product.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.category?.toLowerCase().includes(productSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredOrders = orders.filter(order => {
    const matchesCustomer = orderCustomerFilter === '' ||
      order.customer?.toLowerCase().includes(orderCustomerFilter.toLowerCase());
    const matchesSalesRep = orderSalesRepFilter === '' ||
      order.salesRep?.toLowerCase().includes(orderSalesRepFilter.toLowerCase());
    const matchesDate = orderDateFilter === '' ||
      order.created_at?.includes(orderDateFilter);
    return matchesCustomer && matchesSalesRep && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Admin User'}</p>
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

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'products', label: 'Product Catalog', icon: Package },
              { id: 'orders', label: 'Order Management', icon: ShoppingBag }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}!
              </h2>
              <p className="text-gray-600">Here's what's happening with your business today.</p>
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

            {/* Dashboard Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <ShoppingBag className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">{order.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{order.amount}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
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
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all text-left shadow-sm"
                  >
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Manage Users</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all text-left shadow-sm"
                  >
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Manage Products</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all text-left shadow-sm"
                  >
                    <ShoppingBag className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Manage Orders</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-all text-left shadow-sm">
                    <Settings className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-gray-900">System Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <button
                onClick={() => {
                  setEditUser(null);
                  setIsUserModalOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add User</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="sales_rep">Sales Rep</option>
                  <option value="designer">Designer</option>
                  <option value="customer">Customer</option>
                </select>
                <div className="flex items-center text-gray-600">
                  <Filter className="h-5 w-5 mr-2" />
                  <span>{filteredUsers.length} users</span>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {dataLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product Management Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
              <button
                onClick={() => {
                  setEditProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-semibold flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add Product</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="flex items-center text-gray-600">
                  <Filter className="h-5 w-5 mr-2" />
                  <span>{filteredProducts.length} products</span>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dataLoading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                    <div className="relative">
                      <img 
                        src={product.image_url || 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-blue-600">${product.price}</span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-400 line-through">${product.original_price}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Order Management Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
              <div className="text-sm text-gray-600">
                Total: {orders.length} orders
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="date"
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Filter by customer..."
                    value={orderCustomerFilter}
                    onChange={(e) => setOrderCustomerFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Filter by sales rep..."
                    value={orderSalesRepFilter}
                    onChange={(e) => setOrderSalesRepFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center text-gray-600">
                  <Filter className="h-5 w-5 mr-2" />
                  <span>{filteredOrders.length} orders</span>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {dataLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                              <div className="text-sm text-gray-500">{order.date}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.customer}</div>
                            <div className="text-sm text-gray-500">{order.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {order.status === 'pending' ? (
                                <div className="space-y-1">
                                  <select
                                    onChange={(e) => handleAssignOrder(order.id, e.target.value, 'sales_rep')}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Assign Sales Rep</option>
                                    {salesReps.map(rep => (
                                      <option key={rep.id} value={rep.id}>
                                        {rep.user_profiles?.full_name}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    onChange={(e) => handleAssignOrder(order.id, e.target.value, 'designer')}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Assign Designer</option>
                                    {designers.map(designer => (
                                      <option key={designer.id} value={designer.id}>
                                        {designer.user_profiles?.full_name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-600">
                                  {order.salesRep && <div>Sales: {order.salesRep}</div>}
                                  {order.designer && <div>Designer: {order.designer}</div>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
      />

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditUser(null);
        }}
        onUserCreated={() => {
          fetchUsers();
          setIsUserModalOpen(false);
          setEditUser(null);
        }}
        editUser={editUser}
      />

      <ProductManagementModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditProduct(null);
        }}
        onProductSaved={() => {
          fetchProducts();
          setIsProductModalOpen(false);
          setEditProduct(null);
        }}
        editProduct={editProduct}
      />
    </div>
  );
};

// User Management Modal Component
const UserManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  editUser?: any;
}> = ({ isOpen, onClose, onUserCreated, editUser }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'customer' as 'admin' | 'sales_rep' | 'designer' | 'customer',
    company_name: '',
    specialties: '',
    is_active: true,
    password: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editUser) {
      setFormData({
        full_name: editUser.full_name || '',
        email: editUser.email || '',
        phone: editUser.phone || '',
        role: editUser.role || 'customer',
        company_name: editUser.customers?.company_name || editUser.sales_reps?.department || '',
        specialties: editUser.designers?.specialties ? editUser.designers.specialties.join(', ') : '',
        is_active: editUser.is_active !== false,
        password: ''
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'customer',
        company_name: '',
        specialties: '',
        is_active: true,
        password: ''
      });
    }
    setError('');
  }, [editUser, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (editUser) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
            is_active: formData.is_active
          })
          .eq('id', editUser.id);

        if (profileError) throw profileError;

        // Update role-specific tables
        if (formData.role === 'customer') {
          await supabase
            .from('customers')
            .upsert({
              id: editUser.id,
              company_name: formData.company_name || null
            });
        } else if (formData.role === 'sales_rep') {
          await supabase
            .from('sales_reps')
            .upsert({
              id: editUser.id,
              employee_id: editUser.sales_reps?.employee_id || `SR${Date.now()}`,
              department: formData.company_name || 'Sales'
            });
        } else if (formData.role === 'designer') {
          const specialties = formData.specialties 
            ? formData.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : ['Embroidery', 'Custom Stitching'];
            
          await supabase
            .from('designers')
            .upsert({
              id: editUser.id,
              employee_id: editUser.designers?.employee_id || `DS${Date.now()}`,
              specialties: specialties
            });
        }
      } else {
        // Create new user
        if (!formData.password || formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
          return;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          email_confirm: true
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            phone: formData.phone,
            is_active: formData.is_active
          });

        if (profileError) throw profileError;

        // Create role-specific records
        if (formData.role === 'customer') {
          await supabase.from('customers').insert({
            id: authData.user.id,
            company_name: formData.company_name || null,
            total_orders: 0,
            total_spent: 0
          });
        } else if (formData.role === 'sales_rep') {
          await supabase.from('sales_reps').insert({
            id: authData.user.id,
            employee_id: `SR${Date.now()}`,
            department: formData.company_name || 'Sales',
            commission_rate: 10.0,
            total_sales: 0,
            active_customers: 0
          });
        } else if (formData.role === 'designer') {
          const specialties = formData.specialties 
            ? formData.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : ['Embroidery', 'Custom Stitching'];
            
          await supabase.from('designers').insert({
            id: authData.user.id,
            employee_id: `DS${Date.now()}`,
            specialties: specialties,
            hourly_rate: 50.0,
            total_completed: 0,
            average_rating: 0
          });
        }
      }

      onUserCreated();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {editUser ? 'Edit User' : 'Create New User'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={!!editUser}
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="customer">Customer</option>
                  <option value="sales_rep">Sales Representative</option>
                  <option value="designer">Designer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {!editUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimum 8 characters"
                />
              </div>
            )}

            {(formData.role === 'customer' || formData.role === 'sales_rep') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.role === 'customer' ? 'Company Name' : 'Department'}
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {formData.role === 'designer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties (comma-separated)
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Embroidery, Logo Design, Custom Artwork"
                />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active User
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>{editUser ? 'Update User' : 'Create User'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// Product Management Modal Component
const ProductManagementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onProductSaved: () => void;
  editProduct?: any;
}> = ({ isOpen, onClose, onProductSaved, editProduct }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    original_price: '',
    image_url: '',
    tags: '',
    is_active: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editProduct) {
      setFormData({
        title: editProduct.title || '',
        description: editProduct.description || '',
        category: editProduct.category || '',
        price: editProduct.price?.toString() || '',
        original_price: editProduct.original_price?.toString() || '',
        image_url: editProduct.image_url || '',
        tags: editProduct.tags ? editProduct.tags.join(', ') : '',
        is_active: editProduct.is_active !== false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        original_price: '',
        image_url: '',
        tags: '',
        is_active: true
      });
    }
    setError('');
  }, [editProduct, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        image_url: formData.image_url,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
        is_active: formData.is_active,
        created_by: currentUser.id
      };

      if (editProduct) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editProduct.id);

        if (updateError) throw updateError;
      } else {
        // Create new product
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);

        if (insertError) throw insertError;
      }

      onProductSaved();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    'Embroidery',
    'Logo Design',
    'Custom Artwork',
    'Patches',
    'Monogramming',
    'Corporate Branding',
    'Apparel Design',
    'Promotional Items'
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product title"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (Optional)
              </label>
              <input
                type="number"
                name="original_price"
                step="0.01"
                min="0"
                value={formData.original_price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty if no sale price</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., embroidery, logo, custom"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active Product
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>{editProduct ? 'Update Product' : 'Add Product'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;