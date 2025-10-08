import React, { useState } from 'react';
import { Plus, FileText, Eye, CreditCard as Edit, Calendar, DollarSign } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import GenerateInvoiceModal from '../components/GenerateInvoiceModal';
import InvoiceDetailsModal from '../components/InvoiceDetailsModal';
import EditInvoiceModal from '../components/EditInvoiceModal';
import { getInvoices, getCustomersForInvoice } from '../api/supabaseHelpers';
import { Invoice, PaginationParams } from '../types';
import { usePaginatedData } from '../hooks/useAdminData';

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
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
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
    // Disable edit for paid and cancelled invoices
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return;
    }
    setSelectedInvoiceId(invoice.id);
    setIsEditModalOpen(true);
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
          {invoice.status.replace('_', ' ')}
        </span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Management</h2>
          <p className="text-gray-600 mt-1">Generate and manage customer invoices</p>
        </div>
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg font-semibold flex items-center space-x-2"
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
    </div>
  );
};

export default InvoiceManagementTab;