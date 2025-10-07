/**
 * Shopping Cart Dropdown Component
 * 
 * Provides a dropdown interface for:
 * - Viewing cart items and quantities
 * - Removing items from cart
 * - Displaying cart totals
 * - Navigation to checkout
 * - Authentication-aware checkout flow
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { getCurrentUser } from '../../core/api/supabase';

const CartDropdown: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { items, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart();

  /**
   * Memoized cart calculations for performance
   */
  const totalItems = useMemo(() => getTotalItems(), [getTotalItems]);
  const totalPrice = useMemo(() => getTotalPrice(), [getTotalPrice]);

  /**
   * Handle checkout process with authentication check
   */
  const handleCheckout = useCallback(async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Redirect unauthenticated users to login page
      window.location.href = '/login';
      return;
    }

    // Navigate to checkout page for authenticated users
    setIsOpen(false);
    navigate('/checkout');
  }, [navigate]);

  /**
   * Handle cart clearing with confirmation
   */
  const handleClearCart = useCallback(() => {
    clearCart();
    setIsOpen(false);
  }, [clearCart]);

  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
        aria-label={`Shopping cart with ${totalItems} items`}
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Shopping Cart</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded"
                        loading="lazy"
                      />
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500">{item.apparelType}</p>
                        <p className="text-sm font-semibold text-blue-600">{item.price}</p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        aria-label={`Remove ${item.title} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-800">Total:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg"
                  >
                    Checkout ({totalItems} items)
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default CartDropdown;