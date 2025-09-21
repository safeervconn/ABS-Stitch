/**
 * Comprehensive Admin Dashboard Component
 * 
 * Purpose: Full-featured admin dashboard with sidebar navigation and CRUD operations
 * Features:
 * - Expandable sidebar navigation
 * - Overview with KPI stats
 * - User Management with CRUD operations
 * - Order Management with CRUD operations
 * - Product Management with CRUD operations
 * - Real-time database synchronization
 * - Modal dialogs for all operations
 * - Responsive design
 * 
 * Access: Admin role only
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, DollarSign, Package, LogOut, Bell, 
  Menu, X, Plus, Edit, Trash2, Eye, Search, Filter,
  BarChart3, UserPlus, Settings, ChevronLeft, ChevronRight,
  Save, AlertCircle, CheckCircle, Loader, Mail, Phone,
  Calendar, Star, MapPin, Building
} from 'lucide-react';
import { signOut, getCurrentUser, getUserProfile, supabase } from '../lib/supabase';

// Types for our data structures
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name?: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface Product {
  id: string;
  title: string;
  description?: string;
  category: string;
  price: number;
  original_price?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  // State management
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    inProgressOrders: 0,
    monthlyRevenue: 0,
    activeProducts: 0
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'delete' | 'view'>('create');
  const [modalEntity, setModalEntity] = useState<'user' | 'order' | 'product'>('user');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // Navigation items
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'orders', label: 'Order Management', icon: ShoppingBag },
    { id: 'products', label: 'Product Management', icon: Package }
  ];

  // Initialize component
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          if (profile && profile.role === 'admin') {
            setUser(profile);
            await fetchAllData();
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

  // Fetch all data from database
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchUsers(),
        fetchOrders(),
        fetchProducts(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers!inner(
            user_profiles!customers_id_fkey(full_name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const ordersWithCustomerNames = (data || []).map(order => ({
        ...order,
        customer_name: order.customer?.user_profiles?.full_name || 'Unknown'
      }));
      
      setOrders(ordersWithCustomerNames);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // New customers this month
      const { count: newCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', currentMonthStart.toISOString())
        .lte('created_at', currentMonthEnd.toISOString());

      // In-progress orders
      const { count: inProgressOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '(completed,delivered,cancelled)');

      // Monthly revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', currentMonthStart.toISOString())
        .lte('created_at', currentMonthEnd.toISOString());

      const monthlyRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Active products
      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalCustomers: totalCustomers || 0,
        newCustomers: newCustomers || 0,
        inProgressOrders: inProgressOrders || 0,
        monthlyRevenue,
        activeProducts: activeProducts || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Modal handlers
  const openModal = (type: 'create' | 'edit' | 'delete' | 'view', entity: 'user' | 'order' | 'product', item?: any) => {
    setModalType(type);
    setModalEntity(entity);
    setSelectedItem(item);
    setFormData(item || {});
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({});
    setFormErrors({});
    setIsSubmitting(false);
  };

  // Form validation
  const validateForm = () => {
    const errors: any = {};
    
    if (modalEntity === 'user') {
      if (!formData.full_name?.trim()) errors.full_name = 'Full name is required';
      if (!formData.email?.trim()) errors.email = 'Email is required';
      if (!formData.role) errors.role = 'Role is required';
    } else if (modalEntity === 'product') {
      if (!formData.title?.trim()) errors.title = 'Title is required';
      if (!formData.category?.trim()) errors.category = 'Category is required';
      if (!formData.price || formData.price <= 0) errors.price = 'Valid price is required';
    } else if (modalEntity === 'order') {
      if (!formData.customer_id) errors.customer_id = 'Customer is required';
      if (!formData.order_type) errors.order_type = 'Order type is required';
      if (!formData.total_amount || formData.total_amount <= 0) errors.total_amount = 'Valid amount is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      let result;
      
      if (modalEntity === 'user') {
        // Create user profile
        result = await supabase
          .from('user_profiles')
          .insert([{
            ...formData,
            id: crypto.randomUUID(),
            is_active: formData.is_active ?? true
          }]);
      } else if (modalEntity === 'product') {
        result = await supabase
          .from('products')
          .insert([{
            ...formData,
            is_active: formData.is_active ?? true,
            price: parseFloat(formData.price),
            original_price: formData.original_price ? parseFloat(formData.original_price) : null
          }]);
      } else if (modalEntity === 'order') {
        result = await supabase
          .from('orders')
          .insert([{
            ...formData,
            order_number: `ORD-${Date.now()}`,
            total_amount: parseFloat(formData.total_amount),
            status: formData.status || 'pending'
          }]);
      }
      
      if (result?.error) throw result.error;
      
      await fetchAllData();
      closeModal();
    } catch (error) {
      console.error('Error creating item:', error);
      setFormErrors({ general: 'Failed to create item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      let result;
      
      if (modalEntity === 'user') {
        result = await supabase
          .from('user_profiles')
          .update(formData)
          .eq('id', selectedItem.id);
      } else if (modalEntity === 'product') {
        result = await supabase
          .from('products')
          .update({
            ...formData,
            price: parseFloat(formData.price),
            original_price: formData.original_price ? parseFloat(formData.original_price) : null
          })
          .eq('id', selectedItem.id);
      } else if (modalEntity === 'order') {
        result = await supabase
          .from('orders')
          .update({
            ...formData,
            total_amount: parseFloat(formData.total_amount)
          })
          .eq('id', selectedItem.id);
      }
      
      if (result?.error) throw result.error;
      
      await fetchAllData();
      closeModal();
    } catch (error) {
      console.error('Error updating item:', error);
      setFormErrors({ general: 'Failed to update item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      let result;
      
      if (modalEntity === 'user') {
        result = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', selectedItem.id);
      } else if (modalEntity === 'product') {
        result = await supabase
          .from('products')
          .delete()
          .eq('id', selectedItem.id);
      } else if (modalEntity === 'order') {
        result = await supabase
          .from('orders')
          .delete()
          .eq('id', selectedItem.id);
      }
      
      if (result?.error) throw result.error;
      
      await fetchAllData();
      closeModal();
    } catch (error) {
      console.error('Error deleting item:', error);
      setFormErrors({ general: 'Failed to delete item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user/product active status
  const toggleActiveStatus = async (item: any, entity: 'user' | 'product') => {
    try {
      const newStatus = !item.is_active;
      
      if (entity === 'user') {
        await supabase
          .from('user_profiles')
          .update({ is_active: newStatus })
          .eq('id', item.id);
      } else if (entity === 'product') {
        await supabase
          .from('products')
          .update({ is_active: newStatus })
          .eq('id', item.id);
      }
      
      await fetchAllData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Filter data based on search and filters
  const getFilteredData = () => {
    let data: any[] = [];
    
    if (activeTab === 'users') {
      data = users.filter(user => {
        const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
      });
    } else if (activeTab === 'orders') {
      data = orders.filter(order => {
        const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
      });
    } else if (activeTab === 'products') {
      data = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
                            (filterStatus === 'active' && product.is_active) ||
                            (filterStatus === 'inactive' && !product.is_active);
        return matchesSearch && matchesStatus;
      });
    }
    
    return data;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'} flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarExpanded && (
              <div className="flex items-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">Admin</span>
              </div>
            )}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    title={!sidebarExpanded ? item.label : ''}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    {sidebarExpanded && <span className="font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            {sidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'overview' && 'System overview and key metrics'}
                {activeTab === 'users' && 'Manage user accounts and permissions'}
                {activeTab === 'orders' && 'Track and manage customer orders'}
                {activeTab === 'products' && 'Manage product catalog and inventory'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalCustomers}</h3>
                  <p className="text-gray-600 text-sm">Total Customers</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <UserPlus className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.newCustomers}</h3>
                  <p className="text-gray-600 text-sm">New Customers</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.inProgressOrders}</h3>
                  <p className="text-gray-600 text-sm">In-Progress Orders</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">${stats.monthlyRevenue.toFixed(2)}</h3>
                  <p className="text-gray-600 text-sm">Monthly Revenue</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeProducts}</h3>
                  <p className="text-gray-600 text-sm">Active Products</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <ShoppingBag className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-500">{order.customer_name} • ${order.total_amount.toFixed(2)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Management Tabs */}
          {(activeTab === 'users' || activeTab === 'orders' || activeTab === 'products') && (
            <div className="space-y-6">
              {/* Filters and Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                      />
                    </div>

                    {/* Filters */}
                    {activeTab === 'users' && (
                      <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="sales_rep">Sales Rep</option>
                        <option value="designer">Designer</option>
                        <option value="customer">Customer</option>
                      </select>
                    )}

                    {(activeTab === 'orders' || activeTab === 'products') && (
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="all">All Status</option>
                        {activeTab === 'orders' ? (
                          <>
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </>
                        ) : (
                          <>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </>
                        )}
                      </select>
                    )}
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={() => openModal('create', activeTab as 'user' | 'order' | 'product')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create {activeTab.slice(0, -1)}</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {activeTab === 'users' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                        {activeTab === 'orders' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                        {activeTab === 'products' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredData().map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          {activeTab === 'users' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                      {item.full_name?.charAt(0) || 'U'}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.full_name}</div>
                                    <div className="text-sm text-gray-500">{item.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  item.role === 'sales_rep' ? 'bg-green-100 text-green-800' :
                                  item.role === 'designer' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.role.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => toggleActiveStatus(item, 'user')}
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                    item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.is_active ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                              </td>
                            </>
                          )}
                          {activeTab === 'orders' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{item.order_number}</div>
                                <div className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.customer_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {item.order_type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ${item.total_amount.toFixed(2)}
                              </td>
                            </>
                          )}
                          {activeTab === 'products' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.category}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</div>
                                {item.original_price && item.original_price > item.price && (
                                  <div className="text-sm text-gray-500 line-through">${item.original_price.toFixed(2)}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => toggleActiveStatus(item, 'product')}
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                    item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {item.is_active ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(item.created_at).toLocaleDateString()}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => openModal('view', activeTab as 'user' | 'order' | 'product', item)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openModal('edit', activeTab as 'user' | 'order' | 'product', item)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openModal('delete', activeTab as 'user' | 'order' | 'product', item)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete"
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

                {getFilteredData().length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No {activeTab} found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalType === 'create' && `Create ${modalEntity.charAt(0).toUpperCase() + modalEntity.slice(1)}`}
                {modalType === 'edit' && `Edit ${modalEntity.charAt(0).toUpperCase() + modalEntity.slice(1)}`}
                {modalType === 'view' && `View ${modalEntity.charAt(0).toUpperCase() + modalEntity.slice(1)}`}
                {modalType === 'delete' && `Delete ${modalEntity.charAt(0).toUpperCase() + modalEntity.slice(1)}`}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalType === 'delete' ? (
                <div className="text-center">
                  <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Confirm Deletion</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this {modalEntity}? This action cannot be undone.
                  </p>
                  {formErrors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-red-700 text-sm">{formErrors.general}</p>
                    </div>
                  )}
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (modalType === 'create') handleCreate();
                  else if (modalType === 'edit') handleUpdate();
                }} className="space-y-4">
                  {formErrors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-sm">{formErrors.general}</p>
                    </div>
                  )}

                  {/* User Form Fields */}
                  {modalEntity === 'user' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            value={formData.full_name || ''}
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          {formErrors.full_name && <p className="text-red-600 text-sm mt-1">{formErrors.full_name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <select
                            value={formData.role || ''}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="sales_rep">Sales Rep</option>
                            <option value="designer">Designer</option>
                            <option value="customer">Customer</option>
                          </select>
                          {formErrors.role && <p className="text-red-600 text-sm mt-1">{formErrors.role}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active ?? true}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                            disabled={modalType === 'view'}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Product Form Fields */}
                  {modalEntity === 'product' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          disabled={modalType === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        {formErrors.title && <p className="text-red-600 text-sm mt-1">{formErrors.title}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={formData.description || ''}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          disabled={modalType === 'view'}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <input
                            type="text"
                            value={formData.category || ''}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          {formErrors.category && <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price || ''}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          {formErrors.price && <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.original_price || ''}
                            onChange={(e) => setFormData({...formData, original_price: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                          <input
                            type="url"
                            value={formData.image_url || ''}
                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.is_active ?? true}
                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                            disabled={modalType === 'view'}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                      </div>
                    </>
                  )}

                  {/* Order Form Fields */}
                  {modalEntity === 'order' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                          <input
                            type="text"
                            value={formData.order_number || ''}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                          <input
                            type="text"
                            value={formData.customer_id || ''}
                            onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          {formErrors.customer_id && <p className="text-red-600 text-sm mt-1">{formErrors.customer_id}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                          <select
                            value={formData.order_type || ''}
                            onChange={(e) => setFormData({...formData, order_type: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          >
                            <option value="">Select Type</option>
                            <option value="catalog">Catalog</option>
                            <option value="custom">Custom</option>
                          </select>
                          {formErrors.order_type && <p className="text-red-600 text-sm mt-1">{formErrors.order_type}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={formData.status || ''}
                            onChange={(e) => setFormData({...formData, status: e.target.value})}
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          >
                            <option value="pending">Pending</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.total_amount || ''}
                          onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                          disabled={modalType === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        {formErrors.total_amount && <p className="text-red-600 text-sm mt-1">{formErrors.total_amount}</p>}
                      </div>
                    </>
                  )}

                  {/* Form Actions */}
                  {modalType !== 'view' && (
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isSubmitting && <Loader className="h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4" />
                        <span>{modalType === 'create' ? 'Create' : 'Update'}</span>
                      </button>
                    </div>
                  )}

                  {modalType === 'view' && (
                    <div className="flex justify-end pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;