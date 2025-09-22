import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import CrudModal from '../components/CrudModal';
import { getUsers, createUser, updateUser, deleteUser } from '../api/supabaseHelpers';
import { AdminUser, PaginationParams } from '../types';

const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<any>({ data: [], total: 0, page: 1, limit: 25, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<PaginationParams>({
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(params);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [params]);

  const handleParamsChange = (newParams: Partial<PaginationParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  const handleSearch = (search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
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
        await fetchUsers();
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
      await fetchUsers();
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
      await fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const userFields = [
    { key: 'full_name', label: 'Full Name', type: 'text' as const, required: true },
    { key: 'email', label: 'Email', type: 'email' as const, required: true },
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
    { key: 'phone', label: 'Phone', type: 'text' as const },
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
    {
      key: 'avatar_url',
      label: 'Avatar',
      render: (user: AdminUser) => (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-gray-600">
              {user.full_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>
      ),
    },
    { key: 'full_name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
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
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchBar
          value={params.search || ''}
          onChange={handleSearch}
          placeholder="Search users by name or email..."
        />
      </div>

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
        title={modalMode === 'create' ? 'Add New User' : 'Edit User'}
        fields={userFields}
        initialData={selectedUser}
      />
    </div>
  );
};

export default UsersTab;