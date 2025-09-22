import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye } from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import CrudModal from '../components/CrudModal';
import { getOrders, updateOrder, getSalesReps, getDesigners } from '../api/supabaseHelpers';
import { AdminOrder, AdminUser, PaginationParams } from '../types';

interface OrdersTabProps {
  onOrderClick: (order: AdminOrder) => void;
}

const OrdersTab: React.FC<OrdersTabProps> = ({ onOrderClick }) => {
  const [orders, setOrders] = useState<any>({ data: [], total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<PaginationParams>({
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders(params);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchOrders();
  }, [params]);

  useEffect(() => {
    fetchAssignmentOptions();
  }, []);

  const handleParamsChange = (newParams: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  const handleSearch = (search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
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
      if (formData.sales_rep_id) {
        assignedRole = 'sales_rep';
      } else if (formData.assigned_designer_id) {
        assignedRole = 'designer';
      }

      await updateOrder(selectedOrder.id, {
        ...formData,
        assigned_role: assignedRole,
        status: formData.status || (assignedRole ? 'assigned' : selectedOrder.status),
      });
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const orderFields = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'review', label: 'Review' },
        { value: 'completed', label: 'Completed' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'sales_rep_id',
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

  const columns = [
    { key: 'order_number', label: 'Order ID', sortable: true },
    { key: 'customer_name', label: 'Customer', sortable: true },
    {
      key: 'items_summary',
      label: 'Items',
      render: (order: AdminOrder) => (
        <div className="max-w-xs truncate" title={order.items_summary}>
          {order.items_summary}
        </div>
      ),
    },
    { key: 'quantity', label: 'Qty', sortable: true },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (order: AdminOrder) => `$${order.total_amount.toFixed(2)}`,
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
      key: 'assigned_to',
      label: 'Assigned To',
      render: (order: AdminOrder) => (
        <div className="text-sm">
          {order.sales_rep_name && (
            <div className="text-blue-600">SR: {order.sales_rep_name}</div>
          )}
          {order.designer_name && (
            <div className="text-purple-600">D: {order.designer_name}</div>
          )}
          {!order.sales_rep_name && !order.designer_name && (
            <span className="text-gray-400">Unassigned</span>
          )}
        </div>
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

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={params.search || ''}
          onChange={handleSearch}
          placeholder="Search orders by order number..."
        />
      </div>

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