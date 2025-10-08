import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Calendar, User, FileText } from 'lucide-react';
import { getCustomersForInvoice, getUnpaidOrdersForCustomer, createInvoice } from '../api/supabaseHelpers';
import { AdminOrder } from '../types';
import { toast } from '../../utils/toast';

interface GenerateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GenerateInvoiceModal: React.FC<GenerateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customers, setCustomers] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [unpaidOrders, setUnpaidOrders] = useState<AdminOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [monthYear, setMonthYear] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [invoiceLink, setInvoiceLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      // Set default month-year to current month
      const now = new Date();
      const currentMonthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      setMonthYear(currentMonthYear);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchUnpaidOrders();
    } else {
      setUnpaidOrders([]);
      setSelectedOrderIds([]);
    }
  }, [selectedCustomerId, dateFrom, dateTo]);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomersForInvoice();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers');
    }
  };

  const fetchUnpaidOrders = async () => {
    if (!selectedCustomerId) return;
    
    try {
      setLoading(true);
      const orders = await getUnpaidOrdersForCustomer(selectedCustomerId, dateFrom, dateTo);
      setUnpaidOrders(orders);
      setSelectedOrderIds([]);
    } catch (error) {
      console.error('Error fetching unpaid orders:', error);
      setError('Failed to load unpaid orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelection = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(unpaidOrders.map(order => order.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const calculateTotal = () => {
    return unpaidOrders
      .filter(order => selectedOrderIds.includes(order.id))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId || selectedOrderIds.length === 0) {
      setError('Please select a customer and at least one order');
      return;
    }

    if (!invoiceTitle.trim()) {
      setError('Please enter an invoice title');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      const totalAmount = calculateTotal();

      await createInvoice({
        customer_id: selectedCustomerId,
        invoice_title: invoiceTitle.trim(),
        month_year: monthYear,
        payment_link: paymentLink.trim() || null,
        order_ids: selectedOrderIds,
        total_amount: totalAmount,
        status: 'unpaid',
      });

      toast.success('Invoice generated successfully');
      onSuccess();
      
      // Reset form
      setSelectedCustomerId('');
      setDateFrom('');
      setDateTo('');
      setUnpaidOrders([]);
      setSelectedOrderIds([]);
      setInvoiceTitle('');
      setPaymentLink('');
      setInvoiceLink('');
      setError('');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to generate invoice');
      setError('Failed to create invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const totalAmount = calculateTotal();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Generate Invoice</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Customer *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} | {customer.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Invoice Title *
                </label>
                <input
                  type="text"
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., Monthly Invoice - September 2025"
                  required
                />
              </div>

              {/* Month/Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Month/Year *
                </label>
                <input
                  type="text"
                  value={monthYear}
                  onChange={(e) => setMonthYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., September 2025"
                  required
                  disabled
                />
              </div>

              {/* Payment Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Link (Optional)
                </label>
                <input
                  type="url"
                  value={paymentLink}
                  onChange={(e) => setPaymentLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="https://payment-provider.com/invoice/..."
                />
              </div>

              

              {/* Date Range Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Unpaid Orders */}
            {selectedCustomerId && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Unpaid Orders for {selectedCustomer?.full_name}
                  </h3>
                  {unpaidOrders.length > 0 && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.length === unpaidOrders.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Select All</span>
                    </label>
                  )}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Loading orders...</span>
                  </div>
                ) : unpaidOrders.length > 0 ? (
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    {unpaidOrders.map(order => (
                      <label
                        key={order.id}
                        className="flex items-center space-x-3 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{order.order_number}</span>
                            <span className="font-semibold text-gray-900">${order.total_amount?.toFixed(2) || '0'}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-gray-500">
                              {order.order_type === 'custom' ? 'Custom Design' : 'Catalog Item'} •{' '}
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                              {(order.status || 'unknown').replace('_', ' ')}
                            </span>
                          </div>
                          {order.apparel_type_name && (
                            <p className="text-xs text-gray-500 mt-1">
                              {order.apparel_type_name} • {order.custom_width}"×{order.custom_height}"
                            </p>
                          )}
                         
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No unpaid orders found for this customer
                  </div>
                )}
              </div>
            )}

            {/* Total */}
            {selectedOrderIds.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">
                    Total ({selectedOrderIds.length} orders):
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || selectedOrderIds.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Generate Invoice</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GenerateInvoiceModal;