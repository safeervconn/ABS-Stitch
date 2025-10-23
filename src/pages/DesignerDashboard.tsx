import React, { useState, useEffect } from 'react';
import { Palette, Clock, Briefcase, Edit3 } from 'lucide-react';
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
import { editRequestService, EditRequest } from '../services/editRequestService';
import { supabase } from '../lib/supabase';
import {
  createImageColumn,
  createOrderNumberColumn,
  createOrderNameColumn,
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
  const [editRequests, setEditRequests] = useState<(EditRequest & { order?: AdminOrder })[]>([]);
  const [loadingEditRequests, setLoadingEditRequests] = useState(false);

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

  const fetchEditRequests = async () => {
    setLoadingEditRequests(true);
    try {
      const requests = await editRequestService.getAllPendingEditRequests();

      const requestsWithOrders = await Promise.all(
        requests.map(async (request) => {
          const { data: order } = await supabase
            .from('orders')
            .select('id, order_number, order_name, assigned_designer_id')
            .eq('id', request.order_id)
            .maybeSingle();

          if (order && order.assigned_designer_id === user?.id) {
            return { ...request, order };
          }
          return null;
        })
      );

      setEditRequests(requestsWithOrders.filter(Boolean) as any[]);
    } catch (error) {
      console.error('Error fetching edit requests:', error);
    } finally {
      setLoadingEditRequests(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEditRequests();
    }
  }, [user?.id]);

  if (authLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const statCards = [
    { title: 'Total Orders this Month', value: stats.totalOrdersThisMonth, icon: Briefcase, color: 'blue' },
    { title: 'In-Progress Orders', value: stats.inProgressOrdersCount || 0, icon: Clock, color: 'purple' },
    { title: 'Pending Edit Requests', value: editRequests.length, icon: Edit3, color: 'orange' }
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
    createOrderNameColumn(),
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
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Good morning, {user?.full_name?.split(' ')[0] || 'Designer'}!
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Here are your assigned orders and design projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

        {editRequests.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Pending Edit Requests</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {editRequests.map((request) => (
                <EditRequestCard
                  key={request.id}
                  request={request}
                  orderName={request.order?.order_name}
                  orderNumber={request.order?.order_number}
                  onUpdate={() => {
                    fetchEditRequests();
                    refetch();
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">My Assigned Orders</h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your design projects and orders</p>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-red-700">{ordersError}</p>
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