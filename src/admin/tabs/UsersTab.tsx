import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import DataTable from '../components/DataTable';
import FilterBar, { FilterConfig } from '../components/FilterBar';
import CrudModal from '../components/CrudModal';
import { createUser, updateUser, deleteUser } from '../api/supabaseHelpers';
import { AdminUser, PaginationParams } from '../types';
import { usePaginatedData } from '../hooks/useAdminData';
import { getUsers } from '../api/supabaseHelpers';

const UsersTab: React.FC = () => {
  // Use the new paginated data hook
  const { data: users, params, loading, error, updateParams, refetch } = usePaginatedData(
    getUsers,
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
    role: '',
    status: '',
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
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);


  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'sales_rep', label: 'Sales Representative' },
        { value: 'designer', label: 'Designer' },
        { value: 'customer', label: 'Customer' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'disabled', label: 'Disabled' },
      ],
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
    
    if (key === 'role' && value) {
      newParams.role = value;
    } else if (key === 'status' && value) {
      newParams.status = value;
    }
    
    updateParams(newParams);
  };

  const handleClearFilters = () => {
    setFilterValues({
      role: '',
      status: '',
    });
    updateParams(initialParams);
  };

  const handleCreateUser = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (window.confirm(`Are you sure you want to delete ${user.full_name}?`)) {
      try {
        await deleteUser(user.id);
        await refetch();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const newStatus = user.status === 'active' ? 'disabled' : 'active';
      await updateUser(user.id, { status: newStatus });
      await refetch();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status. Please try again.');
    }
  };

  const handleModalSubmit = async (formData: any) => {
    try {
      if (modalMode === 'create') {
        await createUser(formData);
      } else if (selectedUser) {
        await updateUser(selectedUser.id, formData);
      }
      await refetch();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const userFields = [
    { key: 'full_name', label: 'Full Name', type: 'text' as const, required: true },
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
    { key: 'phone', label: 'Phone', type: 'text' as const },
    { key: 'company_name', label: 'Company Name', type: 'text' as const },
    { 
      key: 'role', 
      label: 'Role', 
      type: 'select' as const, 
      required: true,
      options: [
        { value: 'admin', label: 'Administrator' },
        { value: 'sales_rep', label: 'Sales Representative' },
        { value: 'designer', label: 'Designer' },
        { value: 'customer', label: 'Customer' },
      ]
    },
    { 
      key: 'assigned_sales_rep_id', 
      label: 'Assigned Sales Rep', 
      type: 'select' as const,
      options: [
        { value: '', label: 'No Assignment' },
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
      render: (user: AdminUser) => user.company_name || '-',
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (user: AdminUser) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {user.role.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      render: (user: AdminUser) => (
        user.role === 'customer' && user.assigned_sales_rep_name 
          ? user.assigned_sales_rep_name 
          : '-'
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user: AdminUser) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {user.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (user: AdminUser) => new Date(user.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: AdminUser) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditUser(user)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit User"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggleStatus(user)}
            className={`transition-colors ${
              user.status === 'active'
                ? 'text-orange-600 hover:text-orange-900'
                : 'text-green-600 hover:text-green-900'
            }`}
            title={user.status === 'active' ? 'Disable User' : 'Enable User'}
          >
            {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete User"
          >
            <Trash2 className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage employees and their roles</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        <p className="text-gray-600 mt-1">Manage all users: employees, customers, and administrators</p>
      </div>

      {/* Enhanced Filter Bar */}
      <FilterBar
        searchValue={params.search || ''}
        onSearchChange={handleSearch}
        searchPlaceholder="Search employees by name or email..."
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        resultCount={users.total}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        onParamsChange={handleParamsChange}
        currentParams={params}
        loading={loading}
      />

      {/* User Modal */}
      <CrudModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        title={modalMode === 'create' ? 'Add New Employee' : 'Edit Employee'}
        fields={userFields}
        <span>Add User</span>
      />
    </div>
  );
};

export default UsersTab;
  )
}