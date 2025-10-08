import React from 'react';
import { ShoppingBag, Package, CreditCard } from 'lucide-react';
import { getCurrentUser, supabase } from '../../lib/supabase';

const CustomerOverviewTab: React.FC = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) return;

        // Fetch recent orders (last 10)
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            apparel_type:apparel_types(type_name)
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (ordersError) throw ordersError;

        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);
  
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-600 mt-1">Your last 10 orders</p>
            </div>
            <button
              onClick={() => window.location.href = '/customer/dashboard?tab=orders'}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Orders
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{order.order_number || `ORD-${order.id.slice(0, 8)}`}</p>
                      <p className="text-sm text-gray-500">{order.order_type === 'custom' ? 'Custom Design' : 'Catalog Item'} • {new Date(order.created_at).toLocaleDateString()}</p>
                      {order.apparel_type?.type_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          {order.apparel_type.type_name} • {order.custom_width}"×{order.custom_height}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.total_amount?.toFixed(2) || '0.00'}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOverviewTab;
