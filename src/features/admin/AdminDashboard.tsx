import React from 'react';

/**
 * Admin Dashboard Component
 *
 * Note: This component is currently disabled due to missing dependencies.
 * The following files need to be restored:
 * - ./components/AdminLayout
 * - ./tabs/OverviewTab
 * - ./tabs/EmployeesTab
 * - ./tabs/CustomersTab
 * - ./tabs/OrdersTab
 * - ./tabs/ProductsTab
 * - ./tabs/InvoiceManagementTab
 */

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 mb-4">
          The admin dashboard is currently under maintenance. Some components need to be restored.
        </p>
        <p className="text-sm text-gray-500">
          Please contact the system administrator for more information.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
