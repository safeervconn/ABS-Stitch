import React, { useState, useEffect } from 'react';
import { Users, Package, Clock, Eye, CreditCard as Edit, TrendingUp, LogOut } from 'lucide-react';
import DataTable from '../admin/components/DataTable';
import FilterBar, { FilterConfig } from '../admin/components/FilterBar';
import CrudModal from '../admin/components/CrudModal';
import OrderDetailsModal from '../components/OrderDetailsModal';
import NotificationDropdown from '../components/NotificationDropdown';
import { signOut, getCurrentUser, getUserProfile } from '../lib/supabase';
import { getSalesRepDashboardStats, getOrders, updateOrder, getSalesReps, getDesigners } from '../admin/api/supabaseHelpers';
import { AdminOrder, AdminUser, PaginationParams, SalesRepStats } from '../admin/types';
import { usePaginatedData } from '../admin/hooks/useAdminData';

const SalesRepDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SalesRepStats>({
    totalOrdersThisMonth: 0,
    newOrdersCount: 0,
    inProgressOrdersCount: 0,
    underReviewOrdersCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Use the paginated data hook for orders
  const { data: orders, params, loading: ordersLoading, error, updateParams, refetch } = usePaginatedData(
    (params: PaginationParams) => getOrders({ ...params, salesRepId: user?.id }),
    {
      page: 1,
      limit: 25,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
  );

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    status: [],
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
  });

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Assignment options
  const [salesReps, setSalesReps] = useState<AdminUser[]>([]);
  const [designers, setDesigners] = useState<AdminUser[]>([]);

  // Initial params for reset
  const [initialParams] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          if (profile && profile.role === 'sales_rep') {
            setUser(profile);
            await fetchStats(profile.id);
            await fetchAssignmentOptions();
            // Update params with sales rep ID to fetch their orders
            updateParams({ salesRepId: profile.id });
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
  }, [updateParams]);

  const fetchStats = async (salesRepId: string) => {
    try {
      setStatsLoading(true);
      const statsData = await getSalesRepDashboardStats(salesRepId);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAssignmentOptions = async () => {
    try {
      const [salesRepsData, designersData] = await Promise.all([
        getSalesReps(),
        getDesigners(),
      ]);
      setSalesReps(salesRepsData);
      setDesigners(designersData);
    } catch (error) {
      console.error('Error fetching assignment options:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
      key: 'paymentStatus',
      label: 'Payment Status',
      options: [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
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

  const handleParamsChange = (newParams: Partial<PaginationParams>) => {
    updateParams(newParams);
  };

  const handleSearch = (search: string) => {
    updateParams({ search, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      // Handle multi-select status filter
      const statusArray = value ? value.split(',') : [];
      setFilterValues(prev => ({ ...prev, [key]: statusArray }));
      
      const newParams: Partial<PaginationParams> = { page: 1 };
      if (statusArray.length > 0) {
        newParams.status = statusArray;
      }
      updateParams(newParams);
      return;
    }
    
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    const newParams: Partial<PaginationParams> = { page: 1 };
    
    if (key === 'paymentStatus' && value) {
      newParams.paymentStatus = value;
    } else if (key === 'dateFrom' && value) {
      newParams.dateFrom = value;
    } else if (key === 'dateTo' && value) {
      newParams.dateTo = value;
    }
    
    updateParams(newParams);
  };

  const handleClearFilters = () => {
    setFilterValues({
      status: [],
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
    });
    updateParams(initialParams);
  };

  const handleEditOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleModalSubmit = async (formData: any) => {
    if (!selectedOrder) return;

    try {
      await updateOrder(selectedOrder.id, formData);
      await refetch();
      await fetchStats(user.id); // Refresh stats after order update
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
        { value: 'custom', label: 'Custom' },
        { value: 'catalog', label: 'Catalog' },
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
      label: 'Assign to Designer',
      type: 'select' as const,
      options: [
        { value: '', label: 'No Assignment' },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (order: AdminOrder) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {order.file_urls && order.file_urls.length > 0 ? (
            <img
              src={order.file_urls[0]}
              alt="Order file"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=100';
              }}
            />
          ) : (
            <img
              src="https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=100"
              alt="Default order"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ),
    },
    { 
      key: 'order_number', 
      label: 'Order Number', 
      sortable: true,
      render: (order: AdminOrder) => order.order_number || `ORD-${order.id.slice(0, 8)}`
    },
    { key: 'customer_name', label: 'Customer', sortable: true },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (order: AdminOrder) => `$${(order.total_amount || 0).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order: AdminOrder) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      sortable: true,
      render: (order: AdminOrder) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
          {order.payment_status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'assigned_designer_name',
      label: 'Designer',
      render: (order: AdminOrder) => (
        <span className={`text-sm ${order.assigned_designer_name === 'Unassigned' ? 'text-gray-400' : 'text-purple-600'}`}>
          {order.assigned_designer_name || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (order: AdminOrder) => new Date(order.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order: AdminOrder) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditOrder(order)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit Order"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleViewOrder(order)}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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

  const statCards = [
    {
      title: 'Orders This Month',
      value: stats.totalOrdersThisMonth.toString(),
      icon: Package,
      color: 'blue',
    },
    {
      title: 'New Orders',
      value: stats.newOrdersCount.toString(),
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'In Progress',
      value: stats.inProgressOrdersCount.toString(),
      icon: Clock,
      color: 'purple',
    },
    {
      title: 'Under Review',
      value: stats.underReviewOrdersCount.toString(),
      icon: Eye,
      color: 'orange',
    },
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Rep Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
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
            Welcome back, {user?.full_name?.split(' ')[0] || 'Sales Rep'}!
          </h2>
          <p className="text-gray-600">Manage your assigned customers and orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
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

        {/* Orders Section */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">My Assigned Orders</h3>
            <p className="text-gray-600 mt-1">Orders from customers assigned to you</p>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={params.search || ''}
            onSearchChange={handleSearch}
            searchPlaceholder="Search orders by order number..."
            filters={filterConfigs}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            resultCount={orders.total}
            loading={ordersLoading}
          />

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Orders Table */}
          <DataTable
            data={orders}
            columns={columns}
            onParamsChange={handleParamsChange}
            currentParams={params}
            loading={ordersLoading}
          />
        </div>
      </main>

      {/* Order Edit Modal */}
      <CrudModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleModalSubmit}
        title="Edit Order"
        fields={orderFields}
        initialData={selectedOrder}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
};

export default SalesRepDashboard;