import React, { useState } from 'react';
import CustomerLayout from './components/CustomerLayout';
import CustomerOverviewTab from './tabs/CustomerOverviewTab';
import CustomerOrdersTab from './tabs/CustomerOrdersTab';
import CustomerInvoicesTab from './tabs/CustomerInvoicesTab';

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <CustomerOverviewTab />;
      case 'orders':
        return <CustomerOrdersTab />;
      case 'invoices':
        return <CustomerInvoicesTab />;
      default:
        return <CustomerOverviewTab />;
    }
  };

  return (
    <CustomerLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderActiveTab()}
    </CustomerLayout>
  );
};

export default CustomerDashboard;