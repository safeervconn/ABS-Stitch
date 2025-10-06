import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getCurrentUser } from '../lib/supabase';
import { toast } from '../utils/toast';

interface AddToCartButtonProps {
  item: {
    id: string;
    title: string;
    price: string;
    image: string;
    category: string;
  };
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ item, className = "" }) => {
  const { addToCart, items } = useCart();

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
    <button 
      onClick={handleAddToCart}
      className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-2 shadow-lg ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Add to Cart</span>
    </button>
  );
};

export default AddToCartButton;