/**
 * Sales Representative Dashboard Component
 * 
 * Purpose: Dashboard for sales representatives to manage customer relationships and orders
 * Features:
 * - Customer management and communication
 * - Order tracking and assignment
 * - Sales performance metrics
 * - Lead management
 * - Commission tracking
 * 
 * Access: Sales representative role only
 * Navigation: Accessible after sales rep login
 */

import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, DollarSign, LogOut, Bell, Phone, Mail, TrendingUp, Target } from 'lucide-react';
import { tempSignOut, validateUserSession } from '../lib/auth';

const SalesRepDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate user session and ensure sales_rep role
    const currentUser = validateUserSession('sales_rep');
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
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = [
    { title: 'My Customers', value: '45', change: '+3', icon: Users, color: 'blue' },
    { title: 'Active Orders', value: '12', change: '+2', icon: ShoppingBag, color: 'green' },
    { title: 'Monthly Sales', value: '$8,450', change: '+15%', icon: DollarSign, color: 'purple' },
    { title: 'Commission', value: '$845', change: '+12%', icon: Target, color: 'orange' }
  ];

  const recentCustomers = [
    { name: 'Sarah Johnson', company: 'Fashion Startup', lastContact: '2 hours ago', status: 'active' },
    { name: 'Mike Chen', company: 'Tech Company', lastContact: '1 day ago', status: 'pending' },
    { name: 'Emily Rodriguez', company: 'Local Business', lastContact: '3 days ago', status: 'active' },
    { name: 'David Park', company: 'Marketing Agency', lastContact: '1 week ago', status: 'inactive' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Sales Rep'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'sales_rep'}</p>
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
            Good morning, {user?.full_name?.split(' ')[0] || 'Sales Rep'}!
          </h2>
          <p className="text-gray-600">Here's your sales performance and customer activity.</p>
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
          
          {/* Customer List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">My Customers</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentCustomers.map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{customer.lastContact}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        customer.status === 'active' ? 'bg-green-100 text-green-800' :
                        customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
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
              <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Call Customer</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                <Mail className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Send Email</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Create Order</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesRepDashboard;