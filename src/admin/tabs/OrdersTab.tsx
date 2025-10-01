import React, { useState, useEffect } from 'react';
import { CreditCard as Edit, Eye, Calendar, DollarSign, CreditCard } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import CrudModal from '../components/CrudModal';
import { updateOrder, getSalesReps, getDesigners } from '../api/supabaseHelpers';
import { AdminOrder, AdminUser, PaginationParams } from '../types';
import { usePaginatedData } from '../hooks/useAdminData';
import { getOrders } from '../api/supabaseHelpers';

interface OrdersTabProps {
  onOrderClick: (order: AdminOrder) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ onOrderClick }) => {
  // Use the new paginated data hook
  const { data: orders, params, loading, error, updateParams, refetch } = usePaginatedData(
    getOrders,
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
    customer: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  // Initial params state for compatibility
  const [initialParams] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  
  // Assignment options
  const [salesReps, setSalesReps] = useState<AdminUser[]>([]);
  const [designers, setDesigners] = useState<AdminUser[]>([]);

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

  useEffect(() => {
    fetchAssignmentOptions();
  }, []);

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
    {
      key: 'amountMin',
      label: 'Min Amount',
      type: 'number' as const,
      placeholder: 'Min $',
    },
    {
      key: 'amountMax',
      label: 'Max Amount',
      type: 'number' as const,
      placeholder: 'Max $',
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
    
    // Apply filters to search params
    const newParams: Partial<PaginationParams> = { page: 1 };
    
    // Add filter-specific logic
    if (key === 'paymentStatus' && value) {
      newParams.paymentStatus = value;
    } else if (key === 'customer' && value) {
      newParams.customerSearch = value;
    } else if (key === 'dateFrom' && value) {
      newParams.dateFrom = value;
    } else if (key === 'dateTo' && value) {
      newParams.dateTo = value;
    } else if (key === 'amountMin' && value) {
      newParams.amountMin = parseFloat(value);
    } else if (key === 'amountMax' && value) {
      newParams.amountMax = parseFloat(value);
    }
    
    updateParams(newParams);
  };

  const handleClearFilters = () => {
    setFilterValues({
      status: [],
      paymentStatus: '',
      customer: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    });
    updateParams(initialParams);
  };

  const handleEditOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData: any) => {
    if (!selectedOrder) return;

    try {
      // Determine assigned role based on which field is filled
      let assignedRole = undefined;
      if (formData.assigned_sales_rep_id) {
        assignedRole = 'sales_rep';
      } else if (formData.assigned_designer_id) {
        assignedRole = 'designer';
      }

      await updateOrder(selectedOrder.id, {
        ...formData,
        assigned_sales_rep_id: formData.assigned_sales_rep_id,
        assigned_role: assignedRole,
        status: formData.status || (assignedRole ? 'assigned' : selectedOrder.status),
      });
      await refetch();
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
      key: 'assigned_sales_rep_id',
      label: 'Assign to Sales Rep',
      type: 'select' as const,
      options: [
        { value: '', label: 'No Assignment' },
        ...salesReps.map(rep => ({ value: rep.id, label: rep.full_name })),
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
      key: 'assigned_sales_rep_name',
      label: 'Sales Rep',
      render: (order: AdminOrder) => (
        <span className={`text-sm ${order.assigned_sales_rep_name === 'Unassigned' ? 'text-gray-400' : 'text-blue-600'}`}>
          {order.assigned_sales_rep_name}
        </span>
      ),
    },
    {
      key: 'assigned_designer_name',
      label: 'Designer',
      render: (order: AdminOrder) => (
        <span className={`text-sm ${order.assigned_designer_name === 'Unassigned' ? 'text-gray-400' : 'text-purple-600'}`}>
          {order.assigned_designer_name}
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
            onClick={() => onOrderClick(order)}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage customer orders and assignments</p>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <FilterBar
        searchValue={params.search || ''}
        onSearchChange={handleSearch}
        searchPlaceholder="Search orders by order number..."
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        resultCount={orders.total}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Orders Table */}
      <DataTable
        data={orders}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
      />

      {/* Order Edit Modal */}
      <CrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        title="Edit Order"
        fields={orderFields}
        initialData={selectedOrder}
      />
    </div>
  );
};

export default OrdersTab;