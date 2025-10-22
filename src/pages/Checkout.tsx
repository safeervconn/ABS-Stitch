/**
 * Checkout Page Component
 * 
 * Features:
 * - Display cart items for review
 * - Customer information form (pre-filled for logged-in users)
 * - Create separate Stock Designs orders for each cart item
 * - Authentication enforcement
 * - Order confirmation and success handling
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, User, Mail, Phone, Loader, CheckCircle, Eye, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import { getCurrentUser, getUserProfile, getCategories } from '../lib/supabase';
import { toast } from '../utils/toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart, removeFromCart, updateCartItem } = useCart();
  const { addOrder } = useOrders();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{id: string, category_name: string}[]>([]);

  useEffect(() => {
    const checkUserAndCart = async () => {
      try {
        // Check if user is authenticated
        const user = await getCurrentUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Check if cart has items
        if (items.length === 0) {
          navigate('/stock-designs');
          return;
        }

        // Get user profile
        const profile = await getUserProfile(user.id);
        if (profile) {
          setCurrentUser(profile);
        }

        // Fetch categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserAndCart();
  }, [navigate, items.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Validate that all items have required fields
    for (const item of items) {
      if (!item.selectedCategoryId) {
        setError(`Please select a category for ${item.title}`);
        return;
      }
      if (!item.customWidth || item.customWidth <= 0) {
        setError(`Please enter a valid width for ${item.title}`);
        return;
      }
      if (!item.customHeight || item.customHeight <= 0) {
        setError(`Please enter a valid height for ${item.title}`);
        return;
      }
    }
    setIsSubmitting(true);
    setError('');

    try {

      // Create a separate order for each cart item
      for (const item of items) {
        const itemPrice = parseFloat(item.price.replace('$', ''));
        const itemTotal = itemPrice; // Always quantity 1

        const orderData = {
          order_type: 'stock_design' as 'Stock Design',
          order_name: item.title,
          stock_design_id: item.id,
          custom_description: `${item.title}`,
          category_id: item.selectedCategoryId,
          custom_width: item.customWidth,
          custom_height: item.customHeight,
          total_amount: itemTotal,
        };

        await addOrder(orderData);
        
        // Small delay between orders to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      clearCart();
      toast.success(`${items.length} order${items.length > 1 ? 's' : ''} placed successfully!`);
      
      // Navigate to customer dashboard instead of showing success modal
      navigate('/customer/dashboard');
    } catch (error) {
      console.error('Error placing orders:', error);
      toast.error('Failed to place orders. Please try again.');
      setError('Failed to place orders. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const handleBackToCart = () => {
    navigate('/stock-designs');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      <Navbar />
      
      {/* Background spotlight effects */}
      <div className="absolute inset-0 -z-10">
        <div className="spotlight spotlight-1"></div>
        <div className="spotlight spotlight-2"></div>
        <div className="spotlight spotlight-3"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Back Button */}
        <button 
          onClick={handleBackToCart}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Stock Designs</span>
        </button>

                {/* Checkout Form */}
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <h1 className="text-3xl font-bold mb-2">Checkout</h1>
              <p className="text-blue-100">Review your items and place your orders</p>
            </div>

              <div className="p-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                  
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items</h2>
                    
                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                          <div className="flex items-center space-x-4">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=100';
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{item.title}</h3>
                              <p className="text-sm text-gray-500">{item.apparelType}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-600">Quantity: 1</span>
                                <span className="font-bold text-blue-600">
                                  {item.price}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from cart"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          {/* Custom Fields for Each Item */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Customization Options</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Apparel Type Dropdown */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Category *
                                </label>
                                <select
                                  value={item.selectedCategoryId || ''}
                                  onChange={(e) => updateCartItem(item.id, { selectedCategoryId: e.target.value })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  required
                                >
                                  <option value="">Select Category</option>
                                  {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.category_name}</option>
                                  ))}
                                </select>
                              </div>
                              
                              {/* Custom Width */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Width (inches) *
                                </label>
                                <input
                                  type="number"
                                  value={item.customWidth || ''}
                                  onChange={(e) => updateCartItem(item.id, { customWidth: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder="Width"
                                  min="0.1"
                                  step="0.1"
                                  required
                                />
                              </div>
                              
                              {/* Custom Height */}
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Height (inches) *
                                </label>
                                <input
                                  type="number"
                                  value={item.customHeight || ''}
                                  onChange={(e) => updateCartItem(item.id, { customHeight: parseFloat(e.target.value) || 0 })}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder="Height"
                                  min="0.1"
                                  step="0.1"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Information */}
                    {currentUser && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-500">Name</p>
                              <p className="font-medium text-gray-800">{currentUser.full_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-800">{currentUser.email}</p>
                            </div>
                          </div>
                          {currentUser.phone && (
                            <div className="flex items-center space-x-3">
                              <Phone className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-800">{currentUser.phone}</p>
                              </div>
                            </div>
                          )}
                          {currentUser.company_name && (
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-500">Company</p>
                                <p className="font-medium text-gray-800">{currentUser.company_name}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Items ({items.length})</span>
                          <span className="font-medium">${getTotalPrice().toFixed(2)}</span>
                        </div>
                        
                        <hr className="border-gray-200" />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span className="text-blue-600">${getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Each item will be processed as a separate order for optimal handling and tracking.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <button
                          type="submit"
                          disabled={isSubmitting || items.length === 0}
                          className="w-full btn-success btn-large flex items-center justify-center space-x-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="loading-spinner-white"></div>
                              <span>Placing Orders...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="h-5 w-5" />
                              <span>Place Orders ({items.length} items)</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Order Process Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">What happens next?</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                          
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Orders are assigned to our team</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Track progress in your dashboard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;