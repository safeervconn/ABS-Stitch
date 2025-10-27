import React, { useState } from 'react';
import { Plus, FileText, Eye, CreditCard as Edit, Calendar, Copy, Link as LinkIcon, CheckCircle, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import GenerateInvoiceModal from '../components/GenerateInvoiceModal';
import InvoiceDetailsModal from '../components/InvoiceDetailsModal';
import EditInvoiceModal from '../components/EditInvoiceModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { getInvoices, getCustomersForInvoice } from '../api/supabaseHelpers';
import { Invoice, PaginationParams } from '../types';
import { usePaginatedData } from '../hooks/useAdminData';
import { CSVColumn } from '../../shared/utils/csvExport';
import { toast } from '../../utils/toast';
import { supabase } from '../../lib/supabase';
import { generatePaymentLink } from '../../services/twoCheckoutService';

const InvoiceManagementTab: React.FC = () => {
  // Use the paginated data hook
  const { data: invoices, params, loading, error, updateParams, refetch } = usePaginatedData(
    getInvoices,
    {
      page: 1,
      limit: 25,
      search: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    }
  );

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: '',
    customer: '',
    monthYear: '',
    dateFrom: '',
    dateTo: '',
  });

  // Modal states
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkAsPaidModalOpen, setIsMarkAsPaidModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [customers, setCustomers] = useState<{ id: string; full_name: string; email: string }[]>([]);

  // Initial params for reset
  const [initialParams] = useState<PaginationParams>({
    page: 1,
    limit: 25,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  React.useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomersForInvoice();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
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

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    const newParams: Partial<PaginationParams> = { page: 1 };
    
    if (key === 'status' && value) {
      newParams.invoiceStatus = value;
    } else if (key === 'dateFrom' && value) {
      newParams.dateFrom = value;
    } else if (key === 'dateTo' && value) {
      newParams.dateTo = value;
    }
    
    updateParams(newParams);
  };

  const handleClearFilters = () => {
    setFilterValues({
      status: '',
      monthYear: '',
      dateFrom: '',
      dateTo: '',
    });
    const resetParams: PaginationParams = {
      ...initialParams,
      invoiceStatus: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    };
    updateParams(resetParams);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
    setIsDetailsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return;
    }
    setSelectedInvoiceId(invoice.id);
    setIsEditModalOpen(true);
  };

  const handleCopyPaymentLink = (invoice: Invoice) => {
    if (invoice.payment_link) {
      navigator.clipboard.writeText(invoice.payment_link);
      toast.success('Payment link copied to clipboard!');
    }
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsMarkAsPaidModalOpen(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!selectedInvoiceForPayment) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', selectedInvoiceForPayment.id);

      if (error) throw error;

      toast.success('Invoice marked as paid!');
      setIsMarkAsPaidModalOpen(false);
      setSelectedInvoiceForPayment(null);
      refetch();
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid');
    }
  };

  const handleRegeneratePaymentLink = async (invoice: Invoice) => {
    try {
      const { data: invoiceData, error: fetchError } = await supabase
        .from('invoices')
        .select('*, customers!inner(full_name, email)')
        .eq('id', invoice.id)
        .maybeSingle();

      if (fetchError || !invoiceData) {
        throw new Error('Failed to fetch invoice details');
      }

      const { data: ordersData } = await supabase
        .from('orders')
        .select('order_name, order_number, total_amount')
        .eq('invoice_id', invoice.id);

      const baseUrl = window.location.origin;

      const products = ordersData && ordersData.length > 0
        ? ordersData.map((order: any) => ({
            name: (order.order_name && order.order_name.trim()) || `Order ${order.order_number}`,
            price: order.total_amount || 0,
            quantity: 1,
          }))
        : [{
            name: invoiceData.invoice_title || 'Invoice Payment',
            price: invoice.total_amount,
            quantity: 1,
          }];

      const paymentLink = generatePaymentLink({
        invoiceId: invoice.id,
        amount: invoice.total_amount,
        currency: 'USD',
        products,
        customerEmail: invoiceData.customers.email,
        customerName: invoiceData.customers.full_name,
        returnUrl: `${baseUrl}/payment/success`,
        cancelUrl: `${baseUrl}/payment/failure`,
      });

      const { error: updateError } = await supabase
        .from('invoices')
        .update({ payment_link: paymentLink })
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      toast.success('Payment link regenerated!');
      refetch();
    } catch (error) {
      console.error('Error regenerating payment link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to regenerate payment link';
      toast.error(errorMessage);
    }
  };

  const columns = [
    { key: 'invoice_title', label: 'Invoice Title', sortable: true },
    { key: 'customer_name', label: 'Customer', sortable: true },
    {
      key: 'month_year',
      label: 'Period',
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
          {invoice.month_year}
        </div>
      ),
    },
    {
      key: 'order_ids',
      label: 'Orders',
      render: (invoice: Invoice) => `${invoice.order_ids.length} orders`,
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center">
          
          ${invoice.total_amount.toFixed(2)}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="space-y-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status.replace('_', ' ')}
          </span>
          {invoice.tco_reference_number && (
            <div className="text-xs text-gray-500">
              TCO: {invoice.tco_reference_number}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'payment_link',
      label: 'Payment',
      render: (invoice: Invoice) => (
        <div className="flex items-center space-x-1">
          {invoice.payment_link && invoice.status === 'unpaid' && (
            <>
              <button
                onClick={() => handleCopyPaymentLink(invoice)}
                className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                title="Copy Payment Link"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => window.open(invoice.payment_link, '_blank')}
                className="text-green-600 hover:text-green-900 transition-colors p-1"
                title="Open Payment Link"
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleRegeneratePaymentLink(invoice)}
                className="text-purple-600 hover:text-purple-900 transition-colors p-1"
                title="Regenerate Link"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {invoice.status === 'unpaid' && !invoice.payment_link && (
            <button
              onClick={() => handleRegeneratePaymentLink(invoice)}
              className="text-blue-600 hover:text-blue-900 transition-colors text-xs"
              title="Generate Payment Link"
            >
              Generate
            </button>
          )}
          {invoice.status === 'unpaid' && (
            <button
              onClick={() => handleMarkAsPaid(invoice)}
              className="text-green-600 hover:text-green-900 transition-colors p-1"
              title="Mark as Paid"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (invoice: Invoice) => new Date(invoice.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewInvoice(invoice)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="View Invoice"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleEditInvoice(invoice)}
            className={`transition-colors ${
              invoice.status === 'cancelled' || invoice.status === 'paid'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-green-600 hover:text-green-900'
            }`}
            title="Edit Invoice"
            disabled={invoice.status === 'cancelled' || invoice.status === 'paid'}
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const csvColumns: CSVColumn<Invoice>[] = [
    { key: 'invoice_title', label: 'Invoice Title' },
    { key: 'customer_name', label: 'Customer' },
    { key: 'month_year', label: 'Period' },
    {
      key: 'order_ids',
      label: 'Number of Orders',
      format: (invoice) => invoice.order_ids.length.toString()
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      format: (invoice) => invoice.total_amount.toFixed(2)
    },
    {
      key: 'status',
      label: 'Status',
      format: (invoice) => invoice.status.replace('_', ' ')
    },
    {
      key: 'created_at',
      label: 'Created Date',
      format: (invoice) => new Date(invoice.created_at).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Invoice Management</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Generate and manage customer invoices</p>
          </div>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="btn-success btn-large px-6 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Generate Invoice</span>
          </button>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchValue={params.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder="Search invoices by title, customer name, or email..."
          filters={filterConfigs}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          resultCount={invoices.total}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
          </div>
        )}

        {/* Invoices Table */}
        <DataTable
        data={invoices}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
        csvFilename="invoices_filtered"
        csvColumns={csvColumns}
      />


        {/* Generate Invoice Modal */}
        <GenerateInvoiceModal
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onSuccess={() => {
            setIsGenerateModalOpen(false);
            refetch();
          }}
        />

        {/* Invoice Details Modal */}
        <InvoiceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          invoiceId={selectedInvoiceId}
        />

        {/* Edit Invoice Modal */}
        <EditInvoiceModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          invoiceId={selectedInvoiceId}
          onSuccess={() => {
            setIsEditModalOpen(false);
            refetch();
          }}
        />

        {/* Mark as Paid Confirmation Modal */}
        <ConfirmationModal
          isOpen={isMarkAsPaidModalOpen}
          onClose={() => {
            setIsMarkAsPaidModalOpen(false);
            setSelectedInvoiceForPayment(null);
          }}
          onConfirm={confirmMarkAsPaid}
          title="Mark Invoice as Paid"
          message={`Are you sure you want to mark invoice "${selectedInvoiceForPayment?.invoice_title}" as paid? This action will update the invoice status.`}
          confirmText="Mark as Paid"
          cancelText="Cancel"
          type="info"
        />
      </div>
    </div>
  );
};

export default InvoiceManagementTab;