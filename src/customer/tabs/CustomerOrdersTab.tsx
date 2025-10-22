import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Eye, Package } from 'lucide-react';
import { getCurrentUser } from '../../lib/supabase';
import OrderDetailsModal from '../../components/OrderDetailsModal';
import PlaceOrderModal from '../../components/PlaceOrderModal';
import DataTable from '../../admin/components/DataTable';
import FilterBar, { FilterConfig } from '../../admin/components/FilterBar';
import { getCustomerOrdersPaginated } from '../../admin/api/supabaseHelpers';
import { AdminOrder, PaginationParams } from '../../admin/types';
import { usePaginatedData } from '../../admin/hooks/useAdminData';
import { OrderImagePreview } from '../../components/OrderImagePreview';
import { CSVColumn } from '../../shared/utils/csvExport';

const CustomerOrdersTab: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  
  // Filter states
  const [filterValues, setFilterValues] = useState<Record<string, string | string[]>>({
    status: [],
    dateFrom: '',
    dateTo: '',
  });

  // Initial params for reset
  const [initialParams] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Use the paginated data hook for orders - skip initial fetch until customer ID is loaded
  const { data: orders, params, loading, error, updateParams, refetch } = usePaginatedData(
    (params: PaginationParams) => getCustomerOrdersPaginated({ ...params, customer_id: customerId! }),
    {
      page: 1,
      limit: 25,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
    { skipInitialFetch: true }
  );

  // Get current user and set customer ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCustomerId(user.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Trigger initial fetch when customer ID is available
  useEffect(() => {
    if (customerId) {
      updateParams({ page: 1 });
    }
  }, [customerId]);

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

    if (key === 'dateFrom') {
      newParams.dateFrom = stringValue || undefined;
    } else if (key === 'dateTo') {
      newParams.dateTo = stringValue || undefined;
    }

    updateParams(newParams);
  };

  const handleClearFilters = () => {
    setFilterValues({
      status: [],
      dateFrom: '',
      dateTo: '',
    });
    const resetParams: PaginationParams = {
      ...initialParams,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    };
    updateParams(resetParams);
  };

  const handleViewOrder = (order: AdminOrder) => {
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
      render: (order: AdminOrder) => {
        return <OrderImagePreview attachmentId={order.first_attachment_id} alt="Order attachment" />;
      },
    },
    {
      key: 'order_number',
      label: 'Order Number',
      sortable: true,
      render: (order: AdminOrder) => order.order_number || `ORD-${order.id.slice(0, 8)}`
    },
    {
      key: 'order_name',
      label: 'Order Name',
      sortable: true,
      render: (order: AdminOrder) => order.order_name || 'No Order Name'
    },
    {
      key: 'order_type',
      label: 'Type',
      render: (order: AdminOrder) => (
        <span className="text-sm text-gray-600 capitalize">
          {order.order_type === 'custom' ? 'Custom Design' : 'Stock Design'}
        </span>
      ),
    },
    {
      key: 'category_name',
      label: 'Category',
      render: (order: AdminOrder) => (
        <span className="text-sm text-gray-600">
          {order.category_name || '-'}
        </span>
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (order: AdminOrder) => (
        <span className="font-semibold text-gray-900">
          ${(order.total_amount || 0).toFixed(2)}
        </span>
      ),
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
      label: 'Payment',
      sortable: true,
      render: (order: AdminOrder) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
          {order.payment_status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (order: AdminOrder) => new Date(order.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order: AdminOrder) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewOrder(order)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const csvColumns: CSVColumn<AdminOrder>[] = [
    { key: 'order_number', label: 'Order Number' },
    { key: 'order_name', label: 'Order Name' },
    {
      key: 'order_type',
      label: 'Type',
      format: (order) => order.order_type === 'custom' ? 'Custom Design' : 'Catalog Item'
    },
    { key: 'category_name', label: 'Category' },
    {
      key: 'total_amount',
      label: 'Total Amount',
      format: (order) => (order.total_amount || 0).toFixed(2)
    },
    {
      key: 'status',
      label: 'Status',
      format: (order) => order.status.replace('_', ' ')
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      format: (order) => order.payment_status.replace('_', ' ')
    },
    {
      key: 'created_at',
      label: 'Created Date',
      format: (order) => new Date(order.created_at).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Track and manage your orders</p>
          </div>
          <button
            onClick={() => setIsPlaceOrderOpen(true)}
            className="btn-success btn-large px-6 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Place New Order</span>
          </button>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchValue={params.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder="Search orders by order number or description..."
          filters={filterConfigs}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          resultCount={orders.total}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
          </div>
        )}

        {/* Orders Table */}
        <DataTable
        data={orders}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
        csvFilename="my_orders_filtered"
        csvColumns={csvColumns}
      />


        {/* Empty State for No Orders */}
        {!loading && !error && orders.total === 0 && !params.search && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 mt-6">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No orders yet</p>
              <button
                onClick={() => setIsPlaceOrderOpen(true)}
                className="btn-primary px-6"
              >
                Place Your First Order
              </button>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal
          isOpen={isOrderDetailsOpen}
          onClose={() => setIsOrderDetailsOpen(false)}
          order={selectedOrder}
        />

        {/* Place Order Modal */}
        <PlaceOrderModal
          isOpen={isPlaceOrderOpen}
          onClose={() => {
            setIsPlaceOrderOpen(false);
            // Refresh orders after placing a new order
            if (customerId) {
              refetch();
            }
          }}
        />
      </div>
    </div>
  );
};

export default CustomerOrdersTab;