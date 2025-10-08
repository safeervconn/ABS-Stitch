import React, { useState, useEffect } from 'react';
import { FileText, Eye, CreditCard, Calendar } from 'lucide-react';
import { getCurrentUser } from '../../lib/supabase';
import InvoiceDetailsModal from '../../admin/components/InvoiceDetailsModal';
import DataTable from '../../admin/components/DataTable';
import FilterBar, { FilterConfig } from '../../admin/components/FilterBar';
import { getInvoices } from '../../admin/api/supabaseHelpers';
import { Invoice, PaginationParams } from '../../admin/types';
import { usePaginatedData } from '../../admin/hooks/useAdminData';

const CustomerInvoicesTab: React.FC = () => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  
  // Filter states
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: '',
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

  // Use the paginated data hook for invoices - skip initial fetch until customer ID is loaded
  const { data: invoices, params, loading, error, updateParams, refetch } = usePaginatedData(
    (params: PaginationParams) => {
      // Filter invoices by customer ID
      return getInvoices({
        ...params,
        // We'll need to modify getInvoices to accept customer filter
        search: params.search ? `customer_id.eq.${customerId},${params.search}` : `customer_id.eq.${customerId}`,
      });
    },
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
      options: [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
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
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
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

  const columns = [
    { key: 'invoice_title', label: 'Invoice Title', sortable: true },
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
        <span className="font-semibold text-gray-900">
          ${invoice.total_amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
            {invoice.status.replace('_', ' ')}
          </span>
          {invoice.status === 'unpaid' && invoice.payment_link && (
            <button
              onClick={() => handlePayment(invoice.payment_link!)}
              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Pay Invoice"
            >
              <CreditCard className="h-3 w-3" />
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
        <button
          onClick={() => handleViewInvoice(invoice)}
          className="text-blue-600 hover:text-blue-900 transition-colors"
          title="View Invoice"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Invoices</h2>
        <p className="text-gray-600 mt-1">View and manage your invoices</p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchValue={params.search || ''}
        onSearchChange={handleSearch}
        searchPlaceholder="Search invoices by title..."
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        resultCount={invoices.total}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Invoices Table */}
      <DataTable
        data={invoices}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
      />

      {/* Empty State for No Invoices */}
      {!loading && !error && invoices.total === 0 && !params.search && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No invoices yet</p>
            <p className="text-sm text-gray-400 mt-1">Invoices will appear here once generated by our team</p>
          </div>
        </div>
      )}

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