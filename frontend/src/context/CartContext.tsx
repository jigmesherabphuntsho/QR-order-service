import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  tableNumber: number | null;
  setTableNumber: (table: number | null) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;
  addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateItemNotes: (menuItemId: string, notes: string) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('qr_cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [tableNumber, setTableNumberState] = useState<number | null>(() => {
    const saved = localStorage.getItem('qr_table_number');
    return saved ? parseInt(saved) : null;
  });

  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('qr_customer_name') || '';
  });

  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('qr_cart_items', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (tableNumber !== null) {
      localStorage.setItem('qr_table_number', tableNumber.toString());
    } else {
      localStorage.removeItem('qr_table_number');
    }
  }, [tableNumber]);

  useEffect(() => {
    localStorage.setItem('qr_customer_name', customerName);
  }, [customerName]);

  const setTableNumber = (table: number | null) => {
    setTableNumberState(table);
  };

  const addToCart = (item: MenuItem, quantity = 1, notes = '') => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      }
      return [...prev, { menuItem: item, quantity, notes }];
    });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.menuItem.id === menuItemId ? { ...ci, quantity } : ci))
    );
  };

  const updateItemNotes = (menuItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((ci) => (ci.menuItem.id === menuItemId ? { ...ci, notes } : ci))
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== menuItemId));
  };

  const clearCart = () => {
    setCart([]);
    setOrderNotes('');
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        orderNotes,
        setOrderNotes,
        addToCart,
        updateQuantity,
        updateItemNotes,
        removeFromCart,
        clearCart,
        totalAmount,
        totalItems,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
