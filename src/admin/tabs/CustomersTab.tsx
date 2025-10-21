import React, { useState, useEffect } from 'react';
import { CreditCard as Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import CrudModal from '../components/CrudModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { updateCustomer, deleteCustomer, getSalesReps } from '../api/supabaseHelpers';
import { AdminCustomer, AdminUser, PaginationParams } from '../types';
import { usePaginatedData } from '../hooks/useAdminData';
import { getCustomers } from '../api/supabaseHelpers';
import { toast } from '../../utils/toast';
import { CSVColumn } from '../../shared/utils/csvExport';

const CustomersTab: React.FC = () => {
  // Use the new paginated data hook
  const { data: customers, params, loading, error, updateParams, refetch } = usePaginatedData(
    getCustomers,
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
    salesRep: '',
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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  
  // Confirmation modal states
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<AdminCustomer | null>(null);

  // Sales reps for assignment dropdown
  const [salesReps, setSalesReps] = useState<AdminUser[]>([]);

  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        const salesRepsData = await getSalesReps();
        setSalesReps(salesRepsData);
      } catch (error) {
        console.error('Error fetching sales reps:', error);
      }
    };
    
    fetchSalesReps();
  }, []);

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'disabled', label: 'Disabled' },
      ],
    },
    {
      key: 'salesRep',
      label: 'Sales Rep',
      options: salesReps.map(rep => ({ value: rep.id, label: rep.full_name })),
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
    
    // Apply filters to search params
    const newParams: Partial<PaginationParams> = { page: 1 };
    
    if (key === 'status' && value) {
      newParams.status = value;
    } else if (key === 'salesRep' && value) {
      newParams.salesRepId = value;
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
      salesRep: '',
      dateFrom: '',
      dateTo: '',
    });
    const resetParams: PaginationParams = {
      ...initialParams,
      status: undefined,
      salesRepId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    };
    updateParams(resetParams);
  };

  const handleEditCustomer = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (customer: AdminCustomer) => {
    setCustomerToDelete(customer);
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    
    try {
      await deleteCustomer(customerToDelete.id);
      await refetch();
      toast.success(`Customer ${customerToDelete.full_name} deleted successfully`);
      setIsConfirmationOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer. Please try again.');
    }
  };

  const handleToggleStatus = async (customer: AdminCustomer) => {
    try {
      const newStatus = customer.status === 'active' ? 'disabled' : 'active';
      await updateCustomer(customer.id, { status: newStatus });
      await refetch();
      toast.success(`Customer ${customer.full_name} ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status. Please try again.');
    }
  };

  const handleModalSubmit = async (formData: any) => {
    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, formData);
        toast.success(`Customer ${formData.full_name} updated successfully`);
      }
      await refetch();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Failed to save customer changes');
      throw error;
    }
  };

  const customerFields = [
    { key: 'full_name', label: 'Full Name', type: 'text' as const, required: true },
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
    { key: 'phone', label: 'Phone', type: 'text' as const },
    { key: 'company_name', label: 'Company Name', type: 'text' as const },
    { 
      key: 'assigned_sales_rep_id', 
      label: 'Assigned Sales Rep', 
      type: 'select' as const,
      options: [
        ...salesReps.map(rep => ({ value: rep.id, label: rep.full_name })),
      ],
    },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'disabled', label: 'Disabled' },
      ]
    },
  ];

  const columns = [
    { key: 'full_name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'company_name',
      label: 'Company',
      render: (customer: AdminCustomer) => customer.company_name || '-',
    },
    {
      key: 'assigned_sales_rep_name',
      label: 'Sales Rep',
      render: (customer: AdminCustomer) => customer.assigned_sales_rep_name || '-',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (customer: AdminCustomer) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          customer.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {customer.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (customer: AdminCustomer) => new Date(customer.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (customer: AdminCustomer) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditCustomer(customer)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit Customer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(customer)}
            className={`transition-colors ${
              customer.status === 'active'
                ? 'text-orange-600 hover:text-orange-900'
                : 'text-green-600 hover:text-green-900'
            }`}
            title={customer.status === 'active' ? 'Disable Customer' : 'Enable Customer'}
          >
            {customer.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleDeleteCustomer(customer)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete Customer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const csvColumns: CSVColumn<AdminCustomer>[] = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company_name', label: 'Company' },
    { key: 'assigned_sales_rep_name', label: 'Sales Rep' },
    { key: 'status', label: 'Status' },
    {
      key: 'created_at',
      label: 'Created Date',
      format: (customer) => new Date(customer.created_at).toLocaleDateString()
    },
  ];

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
            <p className="text-gray-600 mt-1">Manage customer accounts and relationships</p>
          </div>
        </div>

        {/* Enhanced Filter Bar */}
        <FilterBar
          searchValue={params.search || ''}
          onSearchChange={handleSearch}
          searchPlaceholder="Search customers by name or email..."
          filters={filterConfigs}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          resultCount={customers.total}
          loading={loading}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <DataTable
        data={customers}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
        csvFilename="customers_filtered"
        csvColumns={csvColumns}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Customer Modal */}
        <CrudModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          title="Edit Customer"
          fields={customerFields}
          initialData={selectedCustomer}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isConfirmationOpen}
          onClose={() => {
            setIsConfirmationOpen(false);
            setCustomerToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Customer"
          message={`Are you sure you want to delete "${customerToDelete?.full_name}"? This action cannot be undone and will also delete their authentication account.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default CustomersTab;