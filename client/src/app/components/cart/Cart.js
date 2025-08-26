"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Backend base URL 
const BASE_URL = 'http://localhost:5000'; 

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

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

    // Show a lightweight "added to cart" toast
    setAddedItem({
      name: productName,
      image: productData?.image,
      price: productPrice,
      quantity
    });
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3500);
    
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

  // Update item quantity
  const updateQuantity = async (productId, nextQuantity) => {
    // Update local state immediately
    const updatedItems = cart.items.map(item =>
      item.productId === productId || (typeof item.productId === 'object' && item.productId._id === productId)
        ? { ...item, quantity: Math.max(0, nextQuantity) }
        : item
    ).filter(item => item.quantity > 0);

    const newTotalPrice = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const updatedCart = { items: updatedItems, totalPrice: newTotalPrice };
    setCart(updatedCart);
    localStorage.setItem('localCart', JSON.stringify(updatedCart));

    // Sync to server when possible
    const userId = localStorage.getItem('userId');
    const productIdString = typeof productId === 'string' ? productId : (typeof productId === 'object' ? productId._id : String(productId));
    const isValidHex24 = typeof productIdString === 'string' && /^[a-fA-F0-9]{24}$/.test(productIdString);
    if (userId && isValidHex24) {
      try {
        const res = await fetch(`${BASE_URL}/cart/update-quantity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId: productIdString, quantity: nextQuantity })
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.cart || data);
        } else {
          console.error('Failed to update quantity on server');
        }
      } catch (err) {
        console.error('Error updating quantity:', err);
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
      updateQuantity,
      cartCount, 
      isLoading 
    }}>
      {children}
      {showAddedToast && addedItem && typeof window !== 'undefined' && createPortal((
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Item added to your cart"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowAddedToast(false); }}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            zIndex: 10000,
            maxWidth: 460,
            width: '92vw'
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
            overflow: 'hidden',
            border: '1px solid #ddd'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #efefef' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="#0a0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div style={{ fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {addedItem.quantity} {addedItem.quantity === 1 ? 'item' : 'items'} added to your cart
                </div>
              </div>
              <button onClick={() => setShowAddedToast(false)} aria-label="Close notification" style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 14, padding: 16, alignItems: 'center' }}>
              <div style={{ width: 96, height: 96, position: 'relative', flex: '0 0 96px' }}>
                <Image
                  src={addedItem.image || '/next.svg'}
                  alt={addedItem.name}
                  fill
                  style={{ objectFit: 'cover', borderRadius: 4, background: '#f6f6f6' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>{addedItem.name}</div>
                <div style={{ color: '#444', fontSize: 14 }}>R {Number(addedItem.price || 0).toFixed(2)}</div>
              </div>
            </div>
            <div style={{ padding: 16, paddingTop: 0 }}>
              <Link href="/cart" className="button" style={{ display: 'inline-block', width: '100%', textAlign: 'center', textDecoration: 'none', padding: '14px 16px', borderRadius: 4 }}>GO TO CART</Link>
            </div>
          </div>
        </div>
      ), document.body)}
    </CartContext.Provider>
  );
};