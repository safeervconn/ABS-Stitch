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
    apparelType: string;
  };
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ item, className = "" }) => {
  const { addToCart } = useCart();
  const [currentUser, setCurrentUser] = React.useState<any>(null);

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
      className={`btn-primary flex items-center justify-center space-x-2 ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Add to Cart</span>
    </button>
  );
};

export default AddToCartButton;