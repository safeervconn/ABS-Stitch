import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, Users, ShoppingBag, Settings, FileText, CheckCircle, Eye, EyeOff, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { getCurrentUser } from '../lib/supabase';
import {
  getNotificationsPaginated,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllNotificationsAsRead,
  NotificationFilters
} from '../admin/api/supabaseHelpers';

interface Notification {
  id: number;
  user_id: string;
  type: 'order' | 'user' | 'stock_design' | 'system' | 'invoice';
  message: string;
  read: boolean;
  created_at: string;
}

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const itemsPerPage = 10;

  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    readStatus: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const result = await getNotificationsPaginated(user.id, currentPage, itemsPerPage, filters);
      setNotifications(result.data);
      setTotalPages(result.totalPages);
      setTotalNotifications(result.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number, currentReadStatus: boolean) => {
    try {
      setActionLoading(notificationId);

      if (currentReadStatus) {
        await markNotificationAsUnread(notificationId);
      } else {
        await markNotificationAsRead(notificationId);
      }

      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error toggling notification read status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;

      await markAllNotificationsAsRead(user.id);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof NotificationFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      readStatus: 'all',
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type && filters.type !== 'all') count++;
    if (filters.readStatus && filters.readStatus !== 'all') count++;
    return count;
  };

  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'order': return <Package className={`${iconClass} text-blue-600`} />;
      case 'invoice': return <FileText className={`${iconClass} text-green-600`} />;
      case 'user': return <Users className={`${iconClass} text-indigo-600`} />;
      case 'stock_design': return <ShoppingBag className={`${iconClass} text-orange-600`} />;
      case 'system': return <CheckCircle className={`${iconClass} text-teal-600`} />;
      default: return <Bell className={`${iconClass} text-gray-400`} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  All Notifications
                  {unreadCount > 0 && (
                    <span className="ml-3 bg-red-500 text-white text-sm rounded-full h-6 w-6 flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {totalNotifications} total notification{totalNotifications !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors relative"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification Type
                    </label>
                    <select
                      value={filters.type || 'all'}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="order">Orders</option>
                      <option value="invoice">Invoices</option>
                      <option value="user">Users</option>
                      <option value="stock_design">Stock Designs</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Read Status
                    </label>
                    <select
                      value={filters.readStatus || 'all'}
                      onChange={(e) => handleFilterChange('readStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Notifications</option>
                      <option value="unread">Unread Only</option>
                      <option value="read">Read Only</option>
                    </select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-12 text-center">
                <div className="loading-spinner-small mx-auto mb-4"></div>
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg mb-2">No notifications found</p>
                <p className="text-gray-400 text-sm">
                  {activeFilterCount > 0
                    ? 'Try adjusting your filters to see more notifications'
                    : 'You do not have any notifications yet'}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors relative ${
                    !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-4 pr-12">
                    <div className="mt-0.5 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-base leading-relaxed ${
                        !notification.read ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {notification.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(notification.id, notification.read)}
                      disabled={actionLoading === notification.id}
                      className={`absolute top-6 right-6 p-2 rounded-lg transition-colors ${
                        notification.read
                          ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                          : 'text-blue-600 hover:text-blue-800 hover:bg-blue-100'
                      }`}
                      title={notification.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {actionLoading === notification.id ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : notification.read ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {!loading && notifications.length > 0 && totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalNotifications)} of {totalNotifications} notifications
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
