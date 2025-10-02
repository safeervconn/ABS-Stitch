import React from 'react';
import { ShoppingBag, Package, CreditCard, Eye } from 'lucide-react';
import { useOrders } from '../../contexts/OrderContext';

const CustomerOverviewTab: React.FC = () => {
  const { orders } = useOrders();
  const [isPlaceOrderOpen, setIsPlaceOrderOpen] = React.useState(false);

  
  // Get recent orders (last 10)
  const recentOrders = orders.slice(0, 10);

  // Color mapping for stat cards
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'yellow':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      case 'green':
        return { bg: 'bg-green-100', text: 'text-green-600' };
      case 'purple':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const stats = [
    { 
      title: 'Total Orders', 
      value: orders.length.toString(), 
      icon: ShoppingBag, 
      color: 'blue' 
    },
    { 
      title: 'In Progress', 
      value: orders.filter(o => ['in_progress', 'under_review'].includes(o.status)).length.toString(), 
      icon: Package, 
      color: 'yellow' 
    },
    { 
      title: 'Completed', 
      value: orders.filter(o => ['completed'].includes(o.status)).length.toString(), 
      icon: ShoppingBag, 
      color: 'green' 
    },
    { 
      title: 'Total Spent', 
      value: `$${orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}`, 
      icon: CreditCard, 
      color: 'purple' 
    }
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back!
        </h2>
        <p className="text-gray-600">Here's an overview of your orders and account.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          return (
            <div 
              key={stat.title} 
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${colorClasses.bg} p-3 rounded-lg`}>
                  <IconComponent className={`h-6 w-6 ${colorClasses.text}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <p className="text-sm text-gray-600 mt-1">Your last 10 orders</p>
        </div>
      </div>
    </div>
                
  );
};


export default CustomerOverviewTab;