import React from 'react';
import { Home, LogOut, CircleUser as UserCircle, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../../components/NotificationDropdown';
import { signOut } from '../../lib/supabase';

export interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  title: string;
  headerIcon: LucideIcon;
  headerIconColor?: string;
  user: {
    full_name?: string;
    role?: string;
  } | null;
  activeTab?: string;
  tabs?: Tab[];
  onTabChange?: (tab: string) => void;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  headerIcon: HeaderIcon,
  headerIconColor = 'bg-blue-100 text-blue-600',
  user,
  activeTab,
  tabs,
  onTabChange,
  children,
}) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className={`p-2 rounded-lg ${headerIconColor}`}>
                <HeaderIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{title}</h1>
              <button
                onClick={() => navigate('/')}
                className="hidden sm:flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Go to Homepage"
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium">Home</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <NotificationDropdown />
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'user'}</p>
                </div>
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Profile Settings"
                >
                  <UserCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      {tabs && tabs.length > 0 && onTabChange && (
        <nav className="bg-white border-b border-gray-200 overflow-x-auto">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 min-w-max sm:min-w-0">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="w-full py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
