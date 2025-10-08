import React, { useState } from 'react';
import CustomerLayout from '../customer/components/CustomerLayout';
import CustomerOverviewTab from '../customer/tabs/CustomerOverviewTab';
import CustomerOrdersTab from '../customer/tabs/CustomerOrdersTab';
import CustomerInvoicesTab from '../customer/tabs/CustomerInvoicesTab';

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL params for initial tab
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

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
    <CustomerLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderActiveTab()}
    </CustomerLayout>
  );
};

export default CustomerDashboard;