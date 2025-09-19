import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { getCurrentUser } from '../lib/supabase';
import '../styles/material3.css';

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
      className={`md-filled-button md-flex md-items-center md-gap-2 ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Add to Cart</span>
    </button>
  );
};

export default AddToCartButton;