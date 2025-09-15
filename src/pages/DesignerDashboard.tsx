/**
 * Designer Dashboard Component
 * 
 * Purpose: Dashboard for designers to manage assigned projects and artwork creation
 * Features:
 * - Project assignment management
 * - Work submission and review process
 * - Design tools and resources
 * - Performance tracking
 * - Client communication
 * 
 * Access: Designer role only
 * Navigation: Accessible after designer login
 */

import React, { useState, useEffect } from 'react';
import { Palette, Clock, CheckCircle, LogOut, Bell, Upload, MessageSquare, Award, Briefcase } from 'lucide-react';
import { tempSignOut, validateUserSession } from '../lib/auth';

const DesignerDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate user session and ensure designer role
    const currentUser = validateUserSession('designer');
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
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const stats = [
    { title: 'Active Projects', value: '8', change: '+2', icon: Briefcase, color: 'blue' },
    { title: 'Pending Review', value: '3', change: '0', icon: Clock, color: 'yellow' },
    { title: 'Completed', value: '24', change: '+4', icon: CheckCircle, color: 'green' },
    { title: 'Rating', value: '4.9', change: '+0.1', icon: Award, color: 'purple' }
  ];

  const activeProjects = [
    { title: 'T-Shirt Design for Fashion Startup', client: 'Sarah Johnson', deadline: '2 days', status: 'in_progress', priority: 'high' },
    { title: 'Logo Design for Tech Company', client: 'Mike Chen', deadline: '5 days', status: 'review', priority: 'medium' },
    { title: 'Marketing Materials', client: 'Emily Rodriguez', deadline: '1 week', status: 'assigned', priority: 'low' },
    { title: 'Brand Identity Package', client: 'David Park', deadline: '3 days', status: 'in_progress', priority: 'high' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Designer Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">1</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Designer'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'designer'}</p>
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
            Hello, {user?.full_name?.split(' ')[0] || 'Designer'}!
          </h2>
          <p className="text-gray-600">Ready to create something amazing today?</p>
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
          
          {/* Active Projects */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activeProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Palette className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{project.title}</p>
                        <p className="text-sm text-gray-500">Client: {project.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Due in {project.deadline}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          project.priority === 'high' ? 'bg-red-100 text-red-800' :
                          project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.priority}
                        </span>
                      </div>
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
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition-all text-left shadow-sm">
                <Upload className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">Upload Work</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg transition-all text-left shadow-sm">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Message Client</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg transition-all text-left shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Mark Complete</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg transition-all text-left shadow-sm">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-gray-900">Time Tracker</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DesignerDashboard;