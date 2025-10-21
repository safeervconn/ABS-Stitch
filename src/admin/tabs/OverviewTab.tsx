import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Package, TrendingUp, Eye, AlertCircle, DollarSign, Clock } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData';
import { AdminOrder } from '../types';


interface OverviewTabProps {
  onOrderClick: (order: AdminOrder) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ onOrderClick }) => {
  // Use the admin data hook with manual refresh control
  const { stats, recentOrders, loading, error, refreshData } = useAdminData();

  // Color mapping for stat cards
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'green':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'purple':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'orange':
        return { bg: 'bg-orange-100', text: 'text-orange-600' };
      case 'indigo':
        return { bg: 'bg-indigo-100', text: 'text-indigo-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const statCards = [
    {
      title: 'Orders This Month',
      value: stats.totalOrdersThisMonth.toString(),
      icon: ShoppingBag,
      color: 'blue',
    },
    {
      title: 'New Customers this Month',
      value: stats.newCustomersThisMonth.toString(),
      icon: Users,
      color: 'green',
    },
    {
      title: 'Revenue This Month',
      value: `$${stats.totalRevenueThisMonth.toLocaleString()}`,
      icon: DollarSign,
      color: 'purple',
    },
    {
      title: 'In Progress',
      value: stats.inProgressOrders.toString(),
      icon: TrendingUp,
      color: 'orange',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts.toString(),
      icon: Package,
      color: 'indigo',
    },
    {
      title: 'New Orders',
      value: stats.newOrdersCount.toString(),
      icon: AlertCircle,
      color: 'blue',
    },
    {
      title: 'Under Review',
      value: stats.underReviewOrdersCount.toString(),
      icon: Clock,
      color: 'orange',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => refreshData(true)}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Manual Refresh Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <button
            onClick={() => refreshData(true)}
            disabled={loading}
            className="btn-primary w-full sm:w-auto"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            const colorClasses = getColorClasses(stat.color);
            return (
              <div
                key={stat.title}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`${colorClasses.bg} p-2 sm:p-3 rounded-lg`}>
                    <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${colorClasses.text}`} />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Orders</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Last 10 orders across all customers</p>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full divide-y divide-gray-200 min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Name
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 sm:px-6 py-8 sm:py-12 text-center text-gray-500 text-sm">
                    No recent orders found
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onOrderClick(order)}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {order.order_name || 'No Order Name'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {order.assigned_sales_rep_name || order.assigned_designer_name || 'Unassigned'}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      ${(order.total_amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;