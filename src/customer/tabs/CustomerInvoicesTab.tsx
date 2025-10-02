import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, CreditCard, Calendar } from 'lucide-react';
import { supabase, getCurrentUser } from '../../lib/supabase';
import InvoiceDetailsModal from '../../admin/components/InvoiceDetailsModal';
import { Invoice } from '../../admin/types';

const CustomerInvoicesTab: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(full_name, company_name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedInvoices: Invoice[] = (data || []).map(invoice => ({
        id: invoice.id,
        customer_id: invoice.customer_id,
        customer_name: invoice.customer?.full_name,
        customer_company_name: invoice.customer?.company_name,
        invoice_title: invoice.invoice_title,
        month_year: invoice.month_year,
        payment_link: invoice.payment_link,
        order_ids: invoice.order_ids,
        total_amount: invoice.total_amount,
        status: invoice.status,
        created_at: invoice.created_at,
        updated_at: invoice.updated_at,
      }));

      setInvoices(transformedInvoices);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayment = (paymentLink: string) => {
    if (paymentLink) {
      window.open(paymentLink, '_blank');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>
        <p className="text-gray-600 mt-1">View and manage your invoices</p>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoice_title}</p>
                      <p className="text-sm text-gray-500">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {invoice.month_year} • {invoice.order_ids.length} orders
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Created: {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${invoice.total_amount.toFixed(2)}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {invoice.status === 'unpaid' && invoice.payment_link && (
                        <button
                          onClick={() => handlePayment(invoice.payment_link!)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Pay Invoice"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No invoices yet</p>
              <p className="text-sm text-gray-400 mt-1">Invoices will appear here once generated by our team</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        invoiceId={selectedInvoiceId}
      />
    </div>
  );
};

export default CustomerInvoicesTab;