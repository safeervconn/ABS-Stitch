/**
 * Sales Representative Dashboard Component
 * 
 * Purpose: Dashboard for sales representatives to manage customer relationships and orders
 * Features:
 * - Customer management and communication
 * - Order tracking and assignment
 * - Sales performance metrics
 * - Lead management
 * - Commission tracking
 * 
 * Access: Sales representative role only
 * Navigation: Accessible after sales rep login
 */

import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, LogOut, Bell, Phone, Mail, TrendingUp, Target, Eye, UserPlus, CreditCard as Edit, Clock } from 'lucide-react';
import { signOut, getCurrentUser, getUserProfile } from '../lib/supabase';
import { useOrders } from '../contexts/OrderContext';
import { getSalesRepDashboardStats, updateOrder, getSalesReps, getDesigners } from '../admin/api/supabaseHelpers';
import { AdminOrder, AdminUser } from '../admin/types';
import OrderDetailsModal from '../components/OrderDetailsModal';
import CrudModal from '../admin/components/CrudModal';
import FilterBar, { FilterConfig } from '../admin/components/FilterBar';

const SalesRepDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrdersThisMonth: 0,
    newOrdersCount: 0,
    inProgressOrdersCount: 0,
    underReviewOrdersCount: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<AdminOrder | null>(null);
  
  // Filter states
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    search: '',
    dateFrom: '',
    dateTo: '',
    status: ['new', 'under_review'], // Default to new and under_review
  });
  
  // Assignment options
  const [salesReps, setSalesReps] = useState<AdminUser[]>([]);
  const [designers, setDesigners] = useState<AdminUser[]>([]);
  
  const { getOrdersByRole, assignDesigner, addComment } = useOrders();
  const { fetchOrders } = useOrders();
  const salesOrders = getOrdersByRole();

  // Filter orders based on current filter values
  const filteredOrders = salesOrders.filter(order => {
    const matchesSearch = !filterValues.search || 
      order.order_number.toLowerCase().includes((filterValues.search as string).toLowerCase()) ||
      order.custom_description?.toLowerCase().includes((filterValues.search as string).toLowerCase());
    
    const orderDate = new Date(order.date);
    const matchesDateFrom = !filterValues.dateFrom || orderDate >= new Date(filterValues.dateFrom as string);
    const matchesDateTo = !filterValues.dateTo || orderDate <= new Date(filterValues.dateTo as string);
    
    const statusArray = Array.isArray(filterValues.status) ? filterValues.status : [];
    const matchesStatus = statusArray.length === 0 || statusArray.includes(order.status);
    
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus;
  });
  // Color mapping for stat cards
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'green':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'purple':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'orange':
        return { bg: 'bg-orange-100', text: 'text-orange-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          if (profile && profile.role === 'sales_rep') {
            setUser(profile);
            // Fetch dashboard stats for this sales rep
            const stats = await getSalesRepDashboardStats(profile.id);
            setDashboardStats(stats);
            
            // Fetch assignment options
            const [salesRepsData, designersData] = await Promise.all([
              getSalesReps(),
              getDesigners(),
            ]);
            setSalesReps(salesRepsData);
            setDesigners(designersData);
          } else {
            console.error('Access denied: User role is', profile?.role, 'but sales_rep required');
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
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Orders This Month', value: dashboardStats.totalOrdersThisMonth.toString(), icon: ShoppingBag, color: 'blue' },
    { title: 'New Orders', value: dashboardStats.newOrdersCount.toString(), icon: Target, color: 'green' },
    { title: 'In Progress Orders', value: dashboardStats.inProgressOrdersCount.toString(), icon: TrendingUp, color: 'purple' },
    { title: 'Under Review Orders', value: dashboardStats.underReviewOrdersCount.toString(), icon: Clock, color: 'orange' }
  ];

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      multi: true,
      options: [
        { value: 'new', label: 'New' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'dateFrom',
      label: 'From Date',
      type: 'date' as const,
    },
    {
      key: 'dateTo',
      label: 'To Date',
      type: 'date' as const,
    },
  ];

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      // Handle multi-select status filter
      const statusArray = value ? value.split(',') : [];
      setFilterValues(prev => ({ ...prev, [key]: statusArray }));
      return;
    }
    
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (search: string) => {
    setFilterValues(prev => ({ ...prev, search }));
  };

  const handleClearFilters = () => {
    setFilterValues({
      search: '',
      dateFrom: '',
      dateTo: '',
      status: ['new', 'under_review'], // Reset to default
    });
  };

  const handleEditOrder = (order: any) => {
    setOrderToEdit(order);
    setIsEditModalOpen(true);
  };

  const handleEditModalSubmit = async (formData: any) => {
    if (!orderToEdit) return;

    try {
      await updateOrder(orderToEdit.id, formData);
      // Refresh the dashboard stats and orders
      const stats = await getSalesRepDashboardStats(user.id);
      setDashboardStats(stats);
      // Refresh the orders list
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const orderFields = [
    {
      key: 'order_type',
      label: 'Order Type',
      type: 'select' as const,
      options: [
        { value: 'catalog', label: 'Catalog' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'new', label: 'New' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'under_review', label: 'Under Review' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'design_size',
      label: 'Design Size',
      type: 'select' as const,
      options: [
        { value: 'small', label: 'Small (3" x 3")' },
        { value: 'medium', label: 'Medium (5" x 5")' },
        { value: 'large', label: 'Large (8" x 10")' },
        { value: 'xl', label: 'Extra Large (12" x 12")' },
        { value: 'custom', label: 'Custom Size' },
      ],
    },
    {
      key: 'apparel_type',
      label: 'Apparel Type',
      type: 'select' as const,
      options: [
        { value: 't-shirt', label: 'T-shirt' },
        { value: 'jacket', label: 'Jacket' },
        { value: 'cap', label: 'Cap' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      key: 'assigned_designer_id',
      type: '' as const,
      options: [
        ...designers.map(designer => ({ value: designer.id, label: designer.full_name })),
      ],
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      type: 'number' as const,
      min: 0,
      step: 0.01,
    },
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

  const handleAddComment = (orderId: string, comment: string) => {
    // Comment functionality removed - implement if needed
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
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
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Sales Rep'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'sales_rep'}</p>
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
            Good morning, {user?.full_name?.split(' ')[0] || 'Sales Rep'}!
          </h2>
          <p className="text-gray-600">Here's your sales performance and customer activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = getColorClasses(stat.color);
            return (
              <div 
                key={stat.title} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${colorClasses.bg} p-3 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 ${colorClasses.text}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Orders Management Section */}
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Customer Orders</h3>
              <p className="text-gray-600 mt-1">Manage orders from your assigned customers</p>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={filterValues.search as string}
            onSearchChange={handleSearch}
            searchPlaceholder="Search by order number..."
            filters={filterConfigs}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            resultCount={filteredOrders.length}
            loading={false}
          />

          {/* Orders List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <ShoppingBag className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-500">{order.customer_name} • {new Date(order.created_at).toLocaleDateString()}</p>
                          {order.custom_description && (
                            <p className="text-sm text-gray-600 mt-1 max-w-md truncate">{order.custom_description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${order.total_amount?.toFixed(2) || '0.00'}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Order"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders match your current filters</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
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

      {/* Order Edit Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditModalSubmit}
        title="Edit Order"
        fields={orderFields}
        initialData={orderToEdit}
      />
    </div>
  );
};

export default SalesRepDashboard;