/**
 * Checkout Page Component
 * 
 * Complete checkout process featuring:
 * - Cart item review and customization
 * - Customer information display
 * - Order creation for each cart item
 * - Authentication enforcement
 * - Form validation and error handling
 * - Success handling with dashboard redirection
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart, User, Mail, Phone, Loader, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../layout/Navbar';
import Footer from '../../layout/Footer';
import { useCart } from '../cart/CartContext';
import { useOrders } from '../orders/OrderContext';
import { getCurrentUser, getUserProfile, getApparelTypes } from '../../core/api/supabase';
import { toast } from '../../core/utils/toast';

const Checkout: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart, removeFromCart, updateCartItem } = useCart();
  const { addOrder } = useOrders();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [apparelTypes, setApparelTypes] = useState<{id: string, type_name: string}[]>([]);

  /**
   * Memoized total price calculation
   */
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);

  /**
   * Check user authentication and load required data
   */
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
          navigate('/catalog');
          return;
        }

        // Get user profile
        const profile = await getUserProfile(user.id);
        if (profile) {
          setCurrentUser(profile);
        }

        // Fetch apparel types
        const apparelTypesData = await getApparelTypes();
        setApparelTypes(apparelTypesData);
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUserAndCart();
  }, [navigate, items.length]);

  /**
   * Handle form submission with validation and order creation
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Validate that all items have required fields
    for (const item of items) {
      if (!item.selectedApparelTypeId) {
        setError(`Please select an apparel type for ${item.title}`);
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
          order_type: 'catalog' as const,
          product_id: item.id,
          custom_description: `${item.title}`,
          apparel_type_id: item.selectedApparelTypeId,
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
      
      // Navigate to customer dashboard
      navigate('/customer/dashboard');
    } catch (error) {
      console.error('Error placing orders:', error);
      toast.error('Failed to place orders. Please try again.');
      setError('Failed to place orders. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [items, addOrder, clearCart, navigate]);

  /**
   * Navigate back to catalog
   */
  const handleBackToCart = useCallback(() => {
    navigate('/catalog');
  }, [navigate]);

  /**
   * Customer information display component
   */
  const CustomerInfoDisplay = useMemo(() => {
    if (!currentUser) return null;

    const contactInfo = [
      { icon: User, label: 'Name', value: currentUser.full_name },
      { icon: Mail, label: 'Email', value: currentUser.email },
      ...(currentUser.phone ? [{ icon: Phone, label: 'Phone', value: currentUser.phone }] : []),
      ...(currentUser.company_name ? [{ icon: User, label: 'Company', value: currentUser.company_name }] : [])
    ];

    return (
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Customer Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div key={index} className="flex items-center space-x-3">
                <IconComponent className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">{info.label}</p>
                  <p className="font-medium text-gray-800">{info.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* SEO Optimization */}
      <Helmet>
        <title>Checkout | ABS STITCH - Complete Your Order</title>
        <meta name="description" content="Complete your custom embroidery order. Review your items, customize specifications, and place your order with ABS STITCH." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

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
          <span>Back to Catalog</span>
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
                            loading="lazy"
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
                            aria-label={`Remove ${item.title} from cart`}
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
                                Apparel Type *
                              </label>
                              <select
                                value={item.selectedApparelTypeId || ''}
                                onChange={(e) => updateCartItem(item.id, { selectedApparelTypeId: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                required
                              >
                                <option value="">Select Type</option>
                                {apparelTypes.map(type => (
                                  <option key={type.id} value={type.id}>{type.type_name}</option>
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
                  {CustomerInfoDisplay}
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items ({items.length})</span>
                        <span className="font-medium">${totalPrice.toFixed(2)}</span>
                      </div>
                      
                      <hr className="border-gray-200" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
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
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader className="h-5 w-5 animate-spin" />
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
});

export default Checkout;