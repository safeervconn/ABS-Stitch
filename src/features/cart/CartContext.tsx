/**
 * Shopping Cart Context Provider
 * 
 * Manages global shopping cart state including:
 * - Cart items with customization options
 * - Add/remove/update cart operations
 * - Cart calculations (totals, quantities)
 * - Persistent cart state across components
 */

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: string;
  image: string;
  apparelType: string;
  quantity: number;
  selectedApparelTypeId?: string;
  customWidth?: number;
  customHeight?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateCartItem: (id: string, updates: Partial<CartItem>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Hook to access cart context with error handling
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = React.memo(({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  /**
   * Add item to cart (quantity always 1, no duplicates)
   */
  const addToCart = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // If item already exists, keep quantity at 1 (no change)
        return prevItems;
      } else {
        // If new item, add with quantity 1
        return [...prevItems, { 
          ...newItem, 
          quantity: 1,
          selectedApparelTypeId: undefined,
          customWidth: undefined,
          customHeight: undefined
        }];
      }
    });
  }, []);

  /**
   * Update specific cart item properties
   */
  const updateCartItem = useCallback((id: string, updates: Partial<CartItem>) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  /**
   * Remove item from cart by ID
   */
  const removeFromCart = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  /**
   * Clear all items from cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  /**
   * Calculate total number of items in cart
   */
  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  /**
   * Calculate total price of all items in cart
   */
  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('$', ''));
      return total + (price * item.quantity);
    }, 0);
  }, [items]);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value: CartContextType = useMemo(() => ({
    items,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice
  }), [items, addToCart, updateCartItem, removeFromCart, clearCart, getTotalItems, getTotalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
});