import React, { useState, useEffect } from 'react';
import { X, Save, Loader, FileText, Package } from 'lucide-react';
import { getInvoiceById, getAllCustomerOrders, updateInvoice } from '../api/supabaseHelpers';
import { Invoice, AdminOrder } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { toast } from '../../utils/toast';
import { notifyAboutInvoiceStatusChange } from '../../services/notificationService';

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
  onSuccess: () => void;
}

const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [allOrders, setAllOrders] = useState<AdminOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [invoiceTitle, setInvoiceTitle] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState<Invoice['status']>('unpaid');
  const [paymentLink, setPaymentLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Confirmation modal states
  const [isStatusConfirmationOpen, setIsStatusConfirmationOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<Invoice['status'] | null>(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoiceData();
    }
  }, [isOpen, invoiceId]);

  const fetchInvoiceData = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      setError('');

      const invoiceData = await getInvoiceById(invoiceId);
      setInvoice(invoiceData);
      setInvoiceTitle(invoiceData.invoice_title);
      setInvoiceStatus(invoiceData.status);
      setPaymentLink(invoiceData.payment_link || '');
      setSelectedOrderIds(invoiceData.order_ids || []);

      // Fetch all orders for this customer
      const customerOrders = await getAllCustomerOrders(invoiceData.customer_id);
      setAllOrders(customerOrders);
    } catch (err: any) {
      console.error('Error fetching invoice data:', err);
      setError(err.message || 'Failed to load invoice data');
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
      setSelectedOrderIds(allOrders.map(order => order.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const calculateTotal = () => {
    return allOrders
      .filter(order => selectedOrderIds.includes(order.id))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invoice || !invoiceTitle.trim()) {
      setError('Invoice title is required');
      return;
    }

    if (selectedOrderIds.length === 0) {
      setError('Please select at least one order');
      return;
    }

    // Check if status change is irreversible
    if (invoiceStatus !== invoice.status && (invoiceStatus === 'paid' || invoiceStatus === 'cancelled')) {
      setPendingStatusChange(invoiceStatus);
      setIsStatusConfirmationOpen(true);
      return;
    }

    await performUpdate();
  };

  const performUpdate = async () => {
    setSubmitting(true);
    setError('');

    try {
      const totalAmount = calculateTotal();
      const previousStatus = invoice.status;

      await updateInvoice(invoice.id, {
        invoice_title: invoiceTitle.trim(),
        status: invoiceStatus,
        payment_link: paymentLink.trim() || null,
        order_ids: selectedOrderIds,
        total_amount: totalAmount,
      });

      if (invoiceStatus !== previousStatus && (invoiceStatus === 'paid' || invoiceStatus === 'cancelled')) {
        await notifyAboutInvoiceStatusChange(invoice.customer_id, invoiceTitle, invoiceStatus);
      }

      toast.success('Invoice updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice');
      setError('Failed to update invoice. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (pendingStatusChange) {
      setInvoiceStatus(pendingStatusChange);
      setIsStatusConfirmationOpen(false);
      setPendingStatusChange(null);
      await performUpdate();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
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

  const totalAmount = calculateTotal();
  const isDisabled = invoice?.status === 'cancelled' || invoice?.status === 'paid';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Invoice</h2>
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

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="loading-spinner mr-2"></div>
                <span className="text-gray-600">Loading invoice data...</span>
              </div>
            ) : invoice ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="e.g., Monthly Invoice - September 2025"
                      required
                      disabled={isDisabled}
                    />
                  </div>

                  {/* Invoice Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={invoiceStatus}
                      onChange={(e) => setInvoiceStatus(e.target.value as Invoice['status'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isDisabled}
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="https://payment-provider.com/invoice/..."
                      disabled={isDisabled}
                    />
                  </div>

                  
                </div>

                {/* Customer Info (Read-only) */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Customer Name</p>
                      <p className="font-medium text-gray-900">{invoice.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{invoice.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Period</p>
                      <p className="font-medium text-gray-900">{invoice.month_year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Current Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orders Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Select Orders ({allOrders.length} available)
                    </h3>
                    {allOrders.length > 0 && !isDisabled && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.length === allOrders.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Select All</span>
                      </label>
                    )}
                  </div>

                  {allOrders.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                      {allOrders.map(order => (
                        <label
                          key={order.id}
                          className={`flex items-center space-x-3 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={(e) => handleOrderSelection(order.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={isDisabled}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-gray-900">{order.order_number}</span>
                                <span className="text-sm text-gray-500 ml-2">({order.order_name || 'No Order Name'})</span>
                              </div>
                              <span className="font-semibold text-gray-900">${order.total_amount?.toFixed(2) || '0'}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-sm text-gray-500">
                                {order.order_type === 'custom' ? 'Custom Design' : 'Stock Design'} •
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                            {order.category_name && (
                              <p className="text-xs text-gray-500 mt-1">
                                {order.category_name}
                                {order.order_type === 'custom' && order.custom_width > 0 && order.custom_height > 0 && (
                                  <> • {order.custom_width}"×{order.custom_height}"</>
                                )}
                              </p>
                            )}
                             {order.edits && order.edits > 0 && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                                  No. of Edits:{ } {order.edits}
                                </span>
                              )}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No orders found for this customer
                    </div>
                  )}
                </div>

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

                {/* Disabled Notice */}
                {isDisabled && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                    <p className="text-gray-600 text-sm">
                      This invoice is {invoice?.status} and cannot be edited.
                    </p>
                  </div>
                )}
              </>
            ) : null}

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-sm flex items-center space-x-2"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner-white w-4 h-4"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Update Invoice</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Status Change Confirmation Modal */}
          <ConfirmationModal
            isOpen={isStatusConfirmationOpen}
            onClose={() => {
              setIsStatusConfirmationOpen(false);
              setPendingStatusChange(null);
            }}
            onConfirm={handleConfirmStatusChange}
            title="Confirm Status Change"
            message={`Are you sure you want to change the invoice status to "${pendingStatusChange}"? This action is irreversible and cannot be undone.`}
            confirmText="Confirm Change"
            cancelText="Cancel"
            type="warning"
          />
        </div>
      </div>
    </>
  );
};

export default EditInvoiceModal;