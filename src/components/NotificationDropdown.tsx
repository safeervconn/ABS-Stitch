import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Eye, EyeOff } from 'lucide-react';
import { getCurrentUser } from '../lib/supabase';
import { 
  getNotificationsWithUnreadCount, 
  markNotificationAsRead, 
  markNotificationAsUnread, 
  markAllNotificationsAsRead 
} from '../admin/api/supabaseHelpers';

interface Notification {
  id: number;
  user_id: string;
  type: 'order' | 'user' | 'stockdesign' | 'system';
  message: string;
  read: boolean;
  created_at: string;
}

const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    // Also fetch unread count when component mounts
    fetchUnreadCount();
    
    // Set up periodic refresh for unread count
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { notifications: _, unreadCount: count } = await getNotificationsWithUnreadCount(user.id, 1);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) return;

      const { notifications: data, unreadCount: count } = await getNotificationsWithUnreadCount(user.id, 20);
      
      // Show toast for new order completion notifications
      if (data && data.length > 0) {
        const newCompletionNotifications = data.filter(notification => 
          !notification.read && 
          notification.type === 'order' && 
          notification.message.includes('completed')
        );
        
        if (newCompletionNotifications.length > 0) {
          const { toast } = await import('../utils/toast');
          newCompletionNotifications.forEach(notification => {
            toast.success(notification.message);
          });
        }
      }
      
      setNotifications(data);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
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
      
      // Refresh notifications
      await fetchNotifications();
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
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setLoading(false);
    }
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '📦';
      case 'user': return '👤';
      case 'stockdesign': return '🛍️';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium flex items-center space-x-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="loading-spinner-small mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 hover:bg-gray-50 transition-colors relative ${
                        !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3 pr-8">
                        <div className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${
                            !notification.read ? 'text-gray-900 font-medium' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleMarkAsRead(notification.id, notification.read)}
                          disabled={actionLoading === notification.id}
                          className={`absolute top-3 right-3 p-1 rounded transition-colors ${
                            notification.read 
                              ? 'text-gray-400 hover:text-blue-600' 
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          title={notification.read ? 'Mark as unread' : 'Mark as read'}
                        >
                          {actionLoading === notification.id ? (
                            <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          ) : notification.read ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{notifications.length} notifications shown</span>
                  <span>{unreadCount} unread</span>
                </div>
                
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;