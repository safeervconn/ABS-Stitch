/**
 * Customer Dashboard Component
 * 
 * Purpose: Dashboard for customers to manage their orders and account
 * Features:
 * - Order history and tracking
 * - Account management
 * - Browse catalog and make purchases
 * - Communication with sales team
 * - Invoice and payment management
 * 
 * Access: Customer role only
 * Navigation: Accessible after customer login
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, CreditCard, LogOut, Bell, Plus, Eye, MessageCircle, Download } from 'lucide-react';
import { tempSignOut, validateUserSession } from '../lib/auth';

const CustomerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate user session and ensure customer role
    const currentUser = validateUserSession('customer');
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleSignOut = async () => {
    try {
      tempSignOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = [
    { title: 'Total Orders', value: '12', change: '+2', icon: ShoppingBag, color: 'blue' },
    { title: 'In Progress', value: '3', change: '0', icon: User, color: 'yellow' },
    { title: 'Completed', value: '9', change: '+2', icon: ShoppingBag, color: 'green' },
    { title: 'Total Spent', value: '$1,245', change: '+$180', icon: CreditCard, color: 'purple' }
  ];

  const recentOrders = [
    { id: 'ORD-20250101', title: 'Custom T-Shirt Design', status: 'in_progress', date: '2 days ago', amount: '$85' },
    { id: 'ORD-20250102', title: 'Logo Design Package', status: 'completed', date: '1 week ago', amount: '$150' },
    { id: 'ORD-20250103', title: 'Marketing Materials', status: 'delivered', date: '2 weeks ago', amount: '$120' },
    { id: 'ORD-20250104', title: 'Brand Identity', status: 'completed', date: '3 weeks ago', amount: '$200' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">1</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Customer'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'customer'}</p>
                </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Customer'}!
          </h2>
          <p className="text-gray-600">Track your orders and manage your account.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={stat.title} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                    <IconComponent className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.title}</p>
                        <p className="text-sm text-gray-500">{order.id} • {order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.amount}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <button 
                onClick={() => window.location.href = '/#contact'}
                className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">New Order</span>
              </button>
              <button 
                onClick={() => window.location.href = '/catalog'}
                className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
              >
                <Eye className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Browse Catalog</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Contact Support</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                <Download className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Download Files</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;