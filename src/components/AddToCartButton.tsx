import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getCurrentUser } from '../lib/supabase';

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
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Redirect unauthenticated users to sign-in page
      window.location.href = '/login';
      return;
    }

    // Add item to cart for authenticated users
    addToCart(item);
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