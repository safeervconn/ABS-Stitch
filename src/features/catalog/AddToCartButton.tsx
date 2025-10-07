/**
 * Add to Cart Button Component
 * 
 * Reusable button component that:
 * - Adds products to shopping cart
 * - Handles authentication state
 * - Provides user feedback via toast notifications
 * - Optimized with memoization for performance
 */

import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../cart/CartContext';
import { getCurrentUser } from '../../core/api/supabase';
import { toast } from '../../core/utils/toast';

interface AddToCartButtonProps {
  item: {
    id: string;
    title: string;
    price: string;
    image: string;
    apparelType: string;
  };
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = React.memo(({ item, className = "" }) => {
  const { addToCart } = useCart();
  const [currentUser, setCurrentUser] = useState<any>(null);

  /**
   * Check user authentication status
   */
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    
    checkUser();
  }, []);

  /**
   * Handle add to cart action with authentication check
   */
  const handleAddToCart = useCallback(async () => {
    if (!currentUser) {
      // Show toast notification for unauthenticated users
      toast.info('Please sign in or create an account to add items to your cart');
      return;
    }

    // Add item to cart for authenticated users
    addToCart(item);
    toast.success(`${item.title} added to cart!`);
  }, [currentUser, addToCart, item]);

  return (
    <button 
      onClick={handleAddToCart}
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg ${className}`}
      aria-label={`Add ${item.title} to cart`}
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Add to Cart</span>
    </button>
  );
});

export default AddToCartButton;