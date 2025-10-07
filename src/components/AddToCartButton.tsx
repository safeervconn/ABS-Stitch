/**
 * Add to Cart Button Component
 * 
 * Optimized button component for adding products to cart with
 * authentication checks and user feedback.
 */

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getCurrentUser } from '../lib/supabase';
import { toast } from '../utils/toast';
import Button from './ui/Button';

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

/**
 * Optimized add to cart button with authentication and feedback
 * Provides clear user feedback and handles authentication flow
 */
const AddToCartButton: React.FC<AddToCartButtonProps> = ({ item, className = "" }) => {
  const { addToCart, items } = useCart();
  const [currentUser, setCurrentUser] = React.useState<any>(null);

  /**
   * Check current user authentication status
   */
  React.useEffect(() => {
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
   * Handle add to cart with authentication check
   */
  const handleAddToCart = async () => {
    if (!currentUser) {
      // Show toast notification for unauthenticated users
      toast.info('Please sign in or create an account to add items to your cart');
      return;
    }

    // Add item to cart for authenticated users
    addToCart(item);
    toast.success(`${item.title} added to cart!`);
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant="primary"
      icon={<ShoppingCart className="h-4 w-4" />}
      animation="lift"
      className={className}
    >
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;