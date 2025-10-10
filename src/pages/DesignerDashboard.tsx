import React, { useState, useEffect } from 'react';
import { Palette, Clock, Briefcase } from 'lucide-react';
import { useAuth } from '../shared/hooks/useAuth';
import { useDashboardStats } from '../shared/hooks/useDashboardStats';
import DashboardLayout from '../shared/components/DashboardLayout';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import StatCard from '../shared/components/StatCard';
import OrderDetailsModal from '../components/OrderDetailsModal';
import EditOrderModal from '../admin/components/EditOrderModal';
import FilterBar, { FilterConfig } from '../admin/components/FilterBar';
import DataTable from '../admin/components/DataTable';
import { usePaginatedData } from '../admin/hooks/useAdminData';
import { getOrders } from '../admin/api/supabaseHelpers';
import { AdminOrder, PaginationParams } from '../admin/types';
import { ORDER_STATUS_OPTIONS, DEFAULT_PAGINATION_PARAMS } from '../shared/constants/orderConstants';
import {
  createImageColumn,
  createOrderNumberColumn,
  createStatusColumn,
  createDateColumn,
  createActionsColumn,
} from '../shared/utils/orderTableUtils';

const DesignerDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth({ requiredRole: 'designer' });
  const { stats, refetch: refetchStats } = useDashboardStats('designer', user?.id);

  const { data: orders, params, loading: ordersLoading, error: ordersError, updateParams, refetch } = usePaginatedData(
    getOrders,
    {
      ...DEFAULT_PAGINATION_PARAMS,
      assignedDesignerId: user?.id || undefined,
      status: ['in_progress'],
    },
    { skipInitialFetch: !user?.id }
  );

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<AdminOrder | null>(null);

  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    status: ['in_progress'],
    dateFrom: '',
    dateTo: '',
    customer: '',
  });

  const [initialParams] = useState<PaginationParams>({
    ...DEFAULT_PAGINATION_PARAMS,
    status: ['in_progress'],
  });

  useEffect(() => {
    if (user?.id && !params.assignedDesignerId) {
      updateParams({
        assignedDesignerId: user.id,
        status: ['in_progress']
      });
    }
  }, [user?.id, params.assignedDesignerId, updateParams]);

  if (authLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const statCards = [
    { title: 'Total Orders this Month', value: stats.totalOrdersThisMonth, icon: Briefcase, color: 'blue' },
    { title: 'In-Progress Orders', value: stats.inProgressOrdersCount || 0, icon: Clock, color: 'purple' }
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      multi: true,
      options: ORDER_STATUS_OPTIONS,
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

  const handleEditOrder = (order: AdminOrder) => {
    setOrderToEdit(order);
    setIsEditModalOpen(true);
  };

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const columns = [
    createImageColumn(),
    createOrderNumberColumn(),
    createStatusColumn(),
    createDateColumn(),
    createActionsColumn(handleEditOrder, handleViewOrder),
  ];

  return (
    <DashboardLayout
      title="Designer Dashboard"
      headerIcon={Palette}
      headerIconColor="bg-purple-100 text-purple-600"
      user={user}
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning, {user?.full_name?.split(' ')[0] || 'Designer'}!
        </h2>
        <p className="text-gray-600">Here are your assigned orders and design projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value.toString()}
            icon={stat.icon}
            color={stat.color}
            delay={index * 100}
          />
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">My Assigned Orders</h3>
            <p className="text-gray-600 mt-1">Manage your design projects and orders</p>
          </div>
        </div>

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

        {ordersError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{ordersError}</p>
          </div>
        )}

        <DataTable
          data={orders}
          columns={columns}
          onParamsChange={handleParamsChange}
          currentParams={params}
          loading={ordersLoading}
        />
      </div>

      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
      />

      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={orderToEdit}
        currentUser={user}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetch();
          refetchStats();
        }}
      />
    </DashboardLayout>
  );
};

export default DesignerDashboard;