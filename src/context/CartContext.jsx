"use client";
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product, selectedSize) => {
    setCartItems((prev) => {
      // Check if item with same ID and Size already exists
      const existingItem = prev.find(
        (item) => item._id === product._id && item.selectedSize === selectedSize
      );

      if (existingItem) {
        return prev.map((item) =>
          item === existingItem ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
      }
      return [...prev, { ...product, selectedSize, quantity: 1, cartId: Date.now() }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartId, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId 
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) } 
          : item
      )
    );
  };

  const removeItem = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeItem, cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);