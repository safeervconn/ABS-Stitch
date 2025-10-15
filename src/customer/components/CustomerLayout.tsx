import React, { useState, useEffect } from 'react';
import { ShoppingBag, FileText, User } from 'lucide-react';
import DashboardLayout from '../../shared/components/DashboardLayout';
import { getCurrentUser, getUserProfile } from '../../lib/supabase';

interface CustomerLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const profile = await getUserProfile(currentUser.id);
          if (profile && (profile.role === 'customer' || !profile.role)) {
            setUser(profile);
          } else {
            console.error('Access denied: User role is', profile?.role);
            window.location.href = '/login';
          }
        } else {
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error checking user:', error);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="My Dashboard"
      headerIcon={User}
      headerIconColor="bg-blue-100 text-blue-600"
      user={user}
      activeTab={activeTab}
      tabs={tabs}
      onTabChange={onTabChange}
    >
      {children}
    </DashboardLayout>
  );
};

export default CustomerLayout;