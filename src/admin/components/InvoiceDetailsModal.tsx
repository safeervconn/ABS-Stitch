import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, DollarSign, Package, Eye } from 'lucide-react';
import { getInvoiceById, getOrdersByIds } from '../api/supabaseHelpers';
import { Invoice, AdminOrder } from '../types';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoiceDetails();
    }
  }, [isOpen, invoiceId]);

  const fetchInvoiceDetails = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      setError('');

      const invoiceData = await getInvoiceById(invoiceId);
      setInvoice(invoiceData);

      if (invoiceData.order_ids && invoiceData.order_ids.length > 0) {
        const ordersData = await getOrdersByIds(invoiceData.order_ids);
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Error fetching invoice details:', err);
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Invoice Details</h2>
              {invoice && (
                <p className="text-gray-600">{invoice.invoice_title}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600">Loading invoice details...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {invoice && !loading && (
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Invoice Information */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Invoice Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Summary</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Invoice Title</p>
                          <p className="font-medium text-gray-800">{invoice.invoice_title}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Period</p>
                          <p className="font-medium text-gray-800">{invoice.month_year}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Customer</p>
                          <p className="font-medium text-gray-800">{invoice.customer_name}</p>
                          <p className="text-sm text-gray-600">{invoice.customer_organization}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders List */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Included Orders ({orders.length})
                    </h3>
                    {orders.length > 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg">
                        {orders.map((order, index) => (
                          <div
                            key={order.id}
                            className={`p-4 ${index !== orders.length - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <Package className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{order.order_number}</p>
                                  <p className="text-sm text-gray-500">
                                    {order.order_type === 'custom' ? 'Custom Design' : 'Catalog Item'} • 
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                  {order.custom_description && (
                                    <p className="text-sm text-gray-600 mt-1 truncate max-w-md">
                                      {order.custom_description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    ${order.total_amount?.toFixed(2) || '75.00'}
                                  </p>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No orders included in this invoice
                      </div>
                    )}
                  </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  
                  {/* Invoice Total */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Total</h3>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                      <div className="text-3xl font-bold text-blue-600">
                        ${invoice.total_amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Metadata */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Info</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-800">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium text-gray-800">
                          {new Date(invoice.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Orders Count</p>
                        <p className="font-medium text-gray-800">{invoice.order_ids.length} orders</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Link */}
                  {invoice.payment_link && invoice.status === 'unpaid' && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Payment</h3>
                      <button
                        onClick={() => window.open(invoice.payment_link, '_blank')}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetailsModal;