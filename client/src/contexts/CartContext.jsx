import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, loading]);

  // Add item to cart
  const addItem = (service) => {
    setItems((prev) => {
      // Check if already in cart
      const exists = prev.find((item) => item.id === service.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, { ...service, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeItem = (serviceId) => {
    setItems((prev) => prev.filter((item) => item.id !== serviceId));
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Check if item is in cart
  const isInCart = (serviceId) => {
    return items.some((item) => item.id === serviceId);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.price) * (item.quantity || 1);
  }, 0);

  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const value = {
    items,
    loading,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    itemCount: items.length,
    subtotal,
    serviceFee,
    total,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}