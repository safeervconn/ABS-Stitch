/**
 * Checkout Page Component
 * 
 * Features:
 * - Display cart items for review
 * - Customer information form (pre-filled for logged-in users)
 * - Create separate catalog orders for each cart item
 * - Authentication enforcement
 * - Order confirmation and success handling
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, User, Mail, Phone, Loader, CheckCircle, Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import { getCurrentUser, getUserProfile } from '../lib/supabase';
import { toast } from '../utils/toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { addOrder } = useOrders();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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

    setIsSubmitting(true);
    setError('');

    try {
      const createdOrderNumbers: string[] = [];

      // Create a separate order for each cart item
      for (const item of items) {
        const itemPrice = parseFloat(item.price.replace('$', ''));
        const itemTotal = itemPrice * item.quantity;

        const orderData = {
          order_type: 'catalog',
          product_id: item.id,
          custom_description: `${item.title} (Quantity: ${item.quantity})`,
          total_amount: itemTotal,
        };

        await addOrder(orderData);
        
        // Generate a mock order number for display
        const mockOrderNumber = `ORD-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 5)}`;
        createdOrderNumbers.push(mockOrderNumber);
        
        // Small delay between orders to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setOrderNumbers(createdOrderNumbers);
      clearCart();
      toast.success(`${items.length} order${items.length > 1 ? 's' : ''} placed successfully!`);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error('Error placing orders:', error);
      toast.error('Failed to place orders. Please try again.');
      setError('Failed to place orders. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/catalog');
  };

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

        {showSuccessMessage ? (
          /* Success Message */
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-2xl shadow-2xl p-8 text-center">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Orders Placed Successfully!
              </h1>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Thank you for your order! We've received your {items.length} catalog item{items.length > 1 ? 's' : ''} and our team will begin processing them shortly.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your Order Numbers:</p>
                <div className="space-y-1">
                  {orderNumbers.map((orderNumber, index) => (
                    <p key={index} className="text-lg font-bold text-blue-600">{orderNumber}</p>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate('/customer/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold"
                  >
                    <Eye className="h-5 w-5" />
                    <span>View My Orders</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/catalog')}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg font-semibold"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Continue Shopping</span>
                  </button>
                </div>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-all font-semibold"
                >
                  Back to Homepage
                </button>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>📧 You'll receive email confirmations shortly</p>
                <p>⏱️ Expected completion: 2-3 business days per item</p>
              </div>
            </div>
          </div>
        ) : (
          /* Checkout Form */
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
                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
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
                              <p className="text-sm text-gray-500">{item.category}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                                <span className="font-bold text-blue-600">
                                  {item.price} × {item.quantity} = ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                                </span>
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
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processing Fee</span>
                          <span className="font-medium">$0.00</span>
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
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;