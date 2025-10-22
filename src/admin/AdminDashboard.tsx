import React, { useState } from 'react';
import AdminLayout from './components/AdminLayout';
import OverviewTab from './tabs/OverviewTab';
import EmployeesTab from './tabs/EmployeesTab';
import CustomersTab from './tabs/CustomersTab';
import OrdersTab from './tabs/OrdersTab';
import StockDesignsTab from './tabs/StockDesignsTab';
import InvoiceManagementTab from './tabs/InvoiceManagementTab';
import OrderDetailsModal from '../components/OrderDetailsModal';
import { AdminOrder } from './types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  const handleOrderClick = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab onOrderClick={handleOrderClick} />;
      case 'employees':
        return <EmployeesTab />;
      case 'customers':
        return <CustomersTab />;
      case 'orders':
        return <OrdersTab onOrderClick={handleOrderClick} />;
      case 'stockdesigns':
        return <StockDesignsTab />;
      case 'invoices':
        return <InvoiceManagementTab />;
      default:
        return <OverviewTab onOrderClick={handleOrderClick} />;
    }
  };

  return (
    <>
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderActiveTab()}
      </AdminLayout>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={() => setIsOrderDetailsOpen(false)}
        order={selectedOrder}
      />
    </>
  );
};

export default AdminDashboard;