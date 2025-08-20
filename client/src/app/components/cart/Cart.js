"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Backend base URL 
const BASE_URL = 'http://localhost:5000'; 

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart from Express backend
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        // Guest user - use localStorage as fallback
        const localCart = localStorage.getItem('localCart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`${BASE_URL}/cart/${userId}`);
        if(res.ok) {
          const data = await res.json();
          setCart(data);
        } else if (res.status === 404) {
          console.log('No cart found for user');
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
        const localCart = localStorage.getItem('localCart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCart();
  }, []);

  // Add to cart 
  const addToCart = async (productId, quantity = 1, productData = null) => {
    const userId = localStorage.getItem('userId');
    const isValidHex24 = typeof productId === 'string' && /^[a-fA-F0-9]{24}$/.test(productId);
    console.log('addToCart called', { productId, quantity, hasUserId: !!userId, isValidHex24 });
    
    // Prepare product data
    let productPrice = 0;
    let productName = "Unknown Product";
    
    if (productData) {
      productPrice = productData.price;
      productName = productData.name;
    }
    
    // Update local state immediately
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    let updatedItems;
    
    if (existingItemIndex >= 0) {
      updatedItems = [...cart.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
    } else {
      updatedItems = [...cart.items, {
        productId,
        name: productName,
        price: productPrice,
        quantity,
        image: productData?.image
      }];
    }
    
    const newTotalPrice = updatedItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    const updatedCart = { 
      items: updatedItems, 
      totalPrice: newTotalPrice
    };
    
    setCart(updatedCart);
    console.log('Cart updated locally', updatedCart);
    localStorage.setItem('localCart', JSON.stringify(updatedCart));
    
    // Sync with Express backend if user is logged in
    if (userId) {
      console.log('User is logged in, attempting server sync...');
      if (isValidHex24) {
        try {
          const res = await fetch(`${BASE_URL}/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId, 
              productId, 
              quantity 
            }),
          });
          
          if (res.ok) {
            const data = await res.json();
            // Update with server response
            setCart(data.cart || data);
            console.log('Server sync successful');
          } else {
            const errorData = await res.json();
            console.error('Failed to add to cart:', errorData);
          }
        } catch (err) {
          console.error('Error adding to cart:', err);
        }
      } else {
        console.warn('Skipping server sync due to invalid productId format. Using local cart only.', productId);
      }
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    const userId = localStorage.getItem('userId');
    const updatedItems = cart.items.filter(item => item.productId !== productId);
    const newTotalPrice = updatedItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
    
    const updatedCart = {
      items: updatedItems,
      totalPrice: newTotalPrice
    };
    
    setCart(updatedCart);
    localStorage.setItem('localCart', JSON.stringify(updatedCart));
    
    if (userId) {
      try {
        const res = await fetch(`${BASE_URL}/cart/remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId }),
        });
        
        if (!res.ok) {
          console.error('Failed to remove from cart on server');
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };

  // Checkout - create order from cart
  const checkout = async () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      throw new Error('User must be logged in to checkout');
    }
    
    try {
      const res = await fetch(`${BASE_URL}/cart/checkout/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        const data = await res.json();
        // Clear cart after successful checkout
        setCart({ items: [], totalPrice: 0 });
        localStorage.removeItem('localCart');
        return data.order;
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to checkout');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      checkout,
      cartCount, 
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};