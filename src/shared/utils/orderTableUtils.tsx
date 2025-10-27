import React from 'react';
import { Eye, CreditCard as Edit } from 'lucide-react';
import { AdminOrder } from '../../admin/types';
import { getStatusColor } from './statusUtils';
import { DEFAULT_IMAGE_URL } from '../constants/orderConstants';
import { OrderImagePreview } from '../../components/OrderImagePreview';

export const createImageColumn = () => ({
  key: 'image',
  label: 'Image',
  render: (order: AdminOrder) => {
    return <OrderImagePreview attachmentId={order.first_attachment_id} alt="Order attachment" />;
  },
});

export const createOrderNumberColumn = () => ({
  key: 'order_number',
  label: 'Order Number',
  sortable: true,
  render: (order: AdminOrder) => order.order_number || `ORD-${order.id.slice(0, 8)}`,
});

export const createOrderNameColumn = () => ({
  key: 'order_name',
  label: 'Order Name',
  sortable: true,
  render: (order: AdminOrder) => order.order_name || 'No Order Name',
});

export const createCustomerNameColumn = () => ({
  key: 'customer_name',
  label: 'Customer Name',
  sortable: true,
});

export const createTotalAmountColumn = () => ({
  key: 'total_amount',
  label: 'Total',
  sortable: true,
  render: (order: AdminOrder) => `$${(order.total_amount || 0).toFixed(2)}`,
});

export const createStatusColumn = () => ({
  key: 'status',
  label: 'Status',
  sortable: true,
  render: (order: AdminOrder) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
      {order.status.replace('_', ' ')}
    </span>
  ),
});

export const createDesignerColumn = () => ({
  key: 'assigned_designer_name',
  label: 'Assigned Designer',
  render: (order: AdminOrder) => (
    <span className={`text-sm ${order.assigned_designer_name === 'Unassigned' || !order.assigned_designer_name ? 'text-gray-400' : 'text-purple-600'}`}>
      {order.assigned_designer_name || 'Unassigned'}
    </span>
  ),
});

export const createDateColumn = () => ({
  key: 'created_at',
  label: 'Created At',
  sortable: true,
  render: (order: AdminOrder) => new Date(order.created_at).toLocaleDateString(),
});

export const createActionsColumn = (
  onEdit: (order: AdminOrder) => void,
  onView: (order: AdminOrder) => void
) => ({
  key: 'actions',
  label: 'Actions',
  render: (order: AdminOrder) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onEdit(order)}
        className="text-blue-600 hover:text-blue-900 transition-colors"
        title="Edit Order"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={() => onView(order)}
        className="text-green-600 hover:text-green-900 transition-colors"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  ),
});
