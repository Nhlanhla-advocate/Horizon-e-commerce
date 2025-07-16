import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  // Fetch cart from backend on mount (if user is logged in)
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await fetch(`/api/cart/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setCart(data);
        }
      } catch (err) {
        // handle error
      }
    };
    fetchCart();
  }, []);

  // Add product to cart
  const addToCart = async (productId, quantity = 1) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
      }
    } catch (err) {
      // handle error
    }
  };

  // Get total items count
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

