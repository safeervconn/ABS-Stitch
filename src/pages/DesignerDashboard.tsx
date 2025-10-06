import React, { useState, useEffect } from 'react';
import { Palette, Clock, CheckCircle, LogOut, Bell, Upload, MessageSquare, Award, Briefcase, Eye, CreditCard as Edit, CircleUser as UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import { signOut, getCurrentUser, getUserProfile } from '../lib/supabase';
import { getDesignerDashboardStats } from '../admin/api/supabaseHelpers';
import { AdminOrder, AdminUser, PaginationParams } from '../admin/types';
import OrderDetailsModal from '../components/OrderDetailsModal';
import EditOrderModal from '../admin/components/EditOrderModal';
import FilterBar, { FilterConfig } from '../admin/components/FilterBar';
import DataTable from '../admin/components/DataTable';
import { usePaginatedData } from '../admin/hooks/useAdminData';
import { getOrders } from '../admin/api/supabaseHelpers';

const DesignerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State to store user ID before initializing the hook
  const [userId, setUserId] = useState<string | null>(null);

  // Use the paginated data hook for orders - skip initial fetch until user is loaded
  const { data: orders, params, loading: ordersLoading, error: ordersError, updateParams, refetch } = usePaginatedData(
    getOrders,
    {
      page: 1,
      limit: 25,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      assignedDesignerId: userId || undefined,
      status: ['in_progress'],
    },
    { skipInitialFetch: true }
  );
  
  const [dashboardStats, setDashboardStats] = useState({
    totalOrdersThisMonth: 0,
    inProgressOrdersCount: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<AdminOrder | null>(null);
  
  // Filter states with default status for designer
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    status: ['in_progress'],
    dateFrom: '',
    dateTo: '',
    customer: '',
  });

  // Initial params for reset with default status
  const [initialParams] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    status: ['in_progress'],
  });

  // Color mapping for stat cards
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'purple':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
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
          if (profile && profile.role === 'designer') {
            setUser(profile);
            setUserId(profile.id);
            // Fetch dashboard stats for this designer
            const stats = await getDesignerDashboardStats(profile.id);
            setDashboardStats(stats);

            // Apply designer filter and default status to orders
            updateParams({
              assignedDesignerId: profile.id,
              status: ['in_progress']
            });
          } else {
            console.error('Access denied: User role is', profile?.role, 'but designer required');
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
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Orders (This Month)', value: dashboardStats.totalOrdersThisMonth.toString(), icon: Briefcase, color: 'blue' },
    { title: 'In-Progress Orders', value: dashboardStats.inProgressOrdersCount.toString(), icon: Clock, color: 'purple' }
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
      key: 'customer',
      label: 'Customer',
      type: 'search' as const,
      placeholder: 'Search by customer name...',
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

  const handleFilterChange = (key: string, value: string | string[]) => {
    if (key === 'status') {
      // Handle multi-select status filter
      const statusArray = Array.isArray(value) ? value : [];
      setFilterValues(prev => ({ ...prev, [key]: statusArray }));

      const newParams: Partial<PaginationParams> = { page: 1 };
      if (statusArray.length > 0) {
        newParams.status = statusArray;
      } else {
        newParams.status = undefined;
      }
      updateParams(newParams);
      return;
    }

    const stringValue = Array.isArray(value) ? value.join(',') : value;
    setFilterValues(prev => ({ ...prev, [key]: stringValue }));

    // Apply filters to search params
    const newParams: Partial<PaginationParams> = { page: 1 };

    if (key === 'customer') {
      newParams.customerSearch = stringValue || undefined;
    } else if (key === 'dateFrom') {
      newParams.dateFrom = stringValue || undefined;
    } else if (key === 'dateTo') {
      newParams.dateTo = stringValue || undefined;
    }

    updateParams(newParams);
  };

  const handleClearFilters = () => {
    setFilterValues({
      status: ['in_progress'],
      dateFrom: '',
      dateTo: '',
      customer: '',
    });
    const resetParams: PaginationParams = {
      ...initialParams,
      assignedDesignerId: user?.id,
      status: ['in_progress'],
      customerSearch: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    };
    updateParams(resetParams);
  };

  const handleEditOrder = (order: any) => {
    setOrderToEdit(order as AdminOrder);
    setIsEditModalOpen(true);
  };
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

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

  // Define columns for the orders table
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Designer'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'designer'}</p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Profile Settings"
                >
                  <UserCircle className="h-5 w-5" />
                </button>
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
            Good morning, {user?.full_name?.split(' ')[0] || 'Designer'}!
          </h2>
          <p className="text-gray-600">Here are your assigned orders and design projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <h3 className="text-2xl font-bold text-gray-900">My Assigned Orders</h3>
              <p className="text-gray-600 mt-1">Manage your design projects and orders</p>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            searchValue={params.search || ''}
            onSearchChange={handleSearch}
            searchPlaceholder="Search by order number..."
            filters={filterConfigs}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            resultCount={orders.total}
            loading={ordersLoading}
          />

          {/* Error Display */}
          {ordersError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{ordersError}</p>
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
      />

      {/* Order Edit Modal */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={orderToEdit}
        currentUser={user}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetch();
          // Refresh dashboard stats
          if (user) {
            getDesignerDashboardStats(user.id).then(setDashboardStats);
          }
        }}
      />
    </div>
  );
};

export default DesignerDashboard;