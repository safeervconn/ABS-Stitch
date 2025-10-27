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
import { getCurrentUser, getUserProfile } from '../lib/supabase';
import { toast } from '../utils/toast';
import { createInvoiceWithPayment } from '../services/invoiceService';
import { supabase } from '../lib/supabase';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart, removeFromCart } = useCart();
  const { addOrder } = useOrders();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
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
          navigate('/stock-designs');
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

    if (!currentUser) {
      setError('User information not found');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const createdOrderIds: string[] = [];

    try {
      console.log('=== CHECKOUT PROCESS STARTED ===');
      console.log('Cart items:', items.length);
      console.log('Customer:', currentUser.email);

      const totalAmount = getTotalPrice();

      console.log('Creating orders...');
      for (const item of items) {
        const itemPrice = parseFloat(item.price.replace('$', ''));

        console.log(`Creating order for: ${item.title}, Price: ${itemPrice}`);

        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: currentUser.id,
            order_type: 'stock_design',
            order_name: item.title,
            stock_design_id: item.id,
            custom_description: `Stock Design: ${item.title}`,
            total_amount: itemPrice,
            status: 'new',
            payment_status: 'unpaid',
          })
          .select()
          .single();

        if (orderError) {
          console.error('Order creation error:', orderError);
          throw new Error(`Failed to create order for ${item.title}: ${orderError.message}`);
        }

        if (!order) {
          throw new Error(`Failed to create order for ${item.title}: No data returned`);
        }

        console.log(`Order created: ${order.order_number} (${order.id})`);
        createdOrderIds.push(order.id);
      }

      console.log(`All ${createdOrderIds.length} orders created successfully`);

      const products = items.map(item => ({
        name: item.title,
        price: parseFloat(item.price.replace('$', '')),
        quantity: 1,
      }));

      console.log('Creating invoice with products:', products);

      const invoiceParams = {
        customer_id: currentUser.id,
        invoice_title: `Stock Designs Purchase - ${new Date().toLocaleDateString()}`,
        month_year: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        order_ids: createdOrderIds,
        total_amount: totalAmount,
        customerEmail: currentUser.email,
        customerName: currentUser.full_name,
        products,
      };

      console.log('Calling createInvoiceWithPayment...');
      const { paymentLink } = await createInvoiceWithPayment(invoiceParams);

      console.log('Payment link generated successfully');
      console.log('=== CHECKOUT PROCESS COMPLETED ===');

      clearCart();
      toast.success('Orders created! Redirecting to payment...');

      setTimeout(() => {
        window.location.href = paymentLink;
      }, 500);
    } catch (error) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Error details:', error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error message:', errorMessage);

      if (createdOrderIds.length > 0) {
        console.log('Cleaning up created orders:', createdOrderIds);
        try {
          await supabase
            .from('orders')
            .delete()
            .in('id', createdOrderIds);
          console.log('Orders cleaned up successfully');
        } catch (cleanupError) {
          console.error('Failed to cleanup orders:', cleanupError);
        }
      }

      toast.error(errorMessage);
      setError(errorMessage);
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
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Order Items ({items.length})</h2>
                    
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
                              <span>Place Orders</span>
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