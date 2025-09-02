"use client";
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// Backend base URL 
const BASE_URL = 'http://localhost:5000';

// Generate or get guest ID for cross-browser cart persistence
const getGuestId = () => {
  if (typeof window === 'undefined') return null;
  
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
}; 

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  // Fetch cart from Express backend
  const fetchCart = useCallback(async () => {
    console.log('fetchCart called');
    const userId = localStorage.getItem('userId');
    const guestId = getGuestId();
    
    // Always try to fetch from server first (either user cart or guest cart)
    const cartId = userId || guestId;
    
    try {
      const res = await fetch(`${BASE_URL}/cart/${cartId}`);
      if(res.ok) {
        const data = await res.json();
        setCart(data);
        // Update localStorage for cross-browser consistency
        localStorage.setItem('localCart', JSON.stringify(data));
        console.log('Cart fetched from server and synced to localStorage');
      } else if (res.status === 404) {
        console.log('No cart found on server, checking localStorage...');
        // Check localStorage for existing cart data
        if (typeof window !== 'undefined') {
          const localCart = localStorage.getItem('localCart');
          if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              if (parsedCart.items && parsedCart.items.length > 0) {
                console.log('Found existing cart in localStorage, using it');
                setCart(parsedCart);
                // Try to sync this cart to server for cross-browser persistence
                if (guestId && !userId) {
                  console.log('Syncing localStorage cart to server for guest user...');
                  for (const item of parsedCart.items) {
                    try {
                      await fetch(`${BASE_URL}/cart/add`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          userId: guestId, 
                          productId: item.productId, 
                          quantity: item.quantity 
                        }),
                      });
                    } catch (e) {
                      console.error('Error syncing item to server:', e);
                    }
                  }
                }
              } else {
                console.log('No items in localStorage cart, initializing empty cart');
                setCart({ items: [], totalPrice: 0 });
              }
            } catch (e) {
              console.error('Error parsing local cart:', e);
              setCart({ items: [], totalPrice: 0 });
            }
          } else {
            console.log('No cart found in localStorage, initializing empty cart');
            setCart({ items: [], totalPrice: 0 });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      // On error, try to get from localStorage as fallback
      if (typeof window !== 'undefined') {
        const localCart = localStorage.getItem('localCart');
        if (localCart) {
          try {
            const parsedCart = JSON.parse(localCart);
            setCart(parsedCart);
            console.log('Using localStorage cart as fallback due to server error');
          } catch (e) {
            console.error('Error parsing local cart:', e);
            setCart({ items: [], totalPrice: 0 });
          }
        } else {
          setCart({ items: [], totalPrice: 0 });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('useEffect fetchCart triggered');
    // Always fetch cart - either user cart or guest cart
    fetchCart();
  }, []);

  // Function to sync cart when user logs in
  const syncCartOnLogin = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      // First, try to get cart from server
      const res = await fetch(`${BASE_URL}/cart/${userId}`);
      if (res.ok) {
        const serverCart = await res.json();
        setCart(serverCart);
        localStorage.setItem('localCart', JSON.stringify(serverCart));
        console.log('Cart synced from server on login');
      } else if (res.status === 404) {
        // No server cart, check if we have local cart to sync
        const localCart = localStorage.getItem('localCart');
        if (localCart) {
          try {
            const parsedLocalCart = JSON.parse(localCart);
            if (parsedLocalCart.items && parsedLocalCart.items.length > 0) {
              console.log('Syncing local cart to server on login...');
              // Sync each item to server
              for (const item of parsedLocalCart.items) {
                await fetch(`${BASE_URL}/cart/add`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    userId, 
                    productId: item.productId, 
                    quantity: item.quantity 
                  }),
                });
              }
              // Fetch the updated cart from server
              const updatedRes = await fetch(`${BASE_URL}/cart/${userId}`);
              if (updatedRes.ok) {
                const updatedData = await updatedRes.json();
                setCart(updatedData);
                localStorage.setItem('localCart', JSON.stringify(updatedData));
                console.log('Local cart successfully synced to server on login');
              }
            }
          } catch (e) {
            console.error('Error syncing local cart to server on login:', e);
          }
        }
      }
      
      // Clear guest cart after successful login
      const guestId = localStorage.getItem('guestId');
      if (guestId) {
        try {
          await fetch(`${BASE_URL}/cart/clear/${guestId}`, { method: 'DELETE' });
          localStorage.removeItem('guestId');
          console.log('Guest cart cleared after login');
        } catch (e) {
          console.error('Error clearing guest cart:', e);
        }
      }
    } catch (err) {
      console.error('Error syncing cart on login:', err);
    }
  }, []);

  // Monitor for user login/logout and sync cart accordingly
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userId') {
        if (e.newValue) {
          // User logged in
          console.log('User logged in, syncing cart...');
          syncCartOnLogin(e.newValue);
        } else {
          // User logged out
          console.log('User logged out, clearing cart...');
          setCart({ items: [], totalPrice: 0 });
          // Keep localStorage cart for guest mode
        }
      }
    };

    // Listen for storage events (cross-tab)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for userId changes in current tab
    const checkUserId = () => {
      const currentUserId = localStorage.getItem('userId');
      if (currentUserId && currentUserId !== localStorage.getItem('lastCheckedUserId')) {
        localStorage.setItem('lastCheckedUserId', currentUserId);
        syncCartOnLogin(currentUserId);
      }
    };

    // Check every 2 seconds for userId changes
    const intervalId = setInterval(checkUserId, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  // Add to cart 
  const addToCart = useCallback(async (productId, quantity = 1, productData = null) => {
    const userId = localStorage.getItem('userId');
    const guestId = getGuestId();
    const cartId = userId || guestId;
    const isValidHex24 = typeof productId === 'string' && /^[a-fA-F0-9]{24}$/.test(productId);
    console.log('addToCart called', { productId, quantity, hasUserId: !!userId, hasGuestId: !!guestId, cartId, isValidHex24 });
    
    // Prepare product data
    let productPrice = 0;
    let productName = "Unknown Product";
    
    if (productData) {
      productPrice = productData.price;
      productName = productData.name;
    }
    
    // Show a lightweight "added to cart" toast
    setAddedItem({
      name: productName,
      image: productData?.image,
      price: productPrice,
      quantity
    });
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3500);
    
    // Always sync with server first for cross-browser persistence
    if (isValidHex24) {
      try {
        console.log('Syncing cart with server for cross-browser persistence...');
        const res = await fetch(`${BASE_URL}/cart/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: cartId, // Use cartId (either userId or guestId)
            productId, 
            quantity 
          }),
        });
        
        if (res.ok) {
          const data = await res.json();
          // Update cart with server response for cross-browser consistency
          const serverCart = data.cart || data;
          setCart(serverCart);
          // Update localStorage to keep it in sync
          localStorage.setItem('localCart', JSON.stringify(serverCart));
          console.log('Server sync successful - cart updated from server and localStorage');
        } else {
          const errorData = await res.json();
          console.error('Failed to add to cart:', errorData);
          // Fallback to local update if server fails
          updateLocalCart(productId, quantity, productData);
        }
      } catch (err) {
        console.error('Error adding to cart:', err);
        // Fallback to local update if server fails
        updateLocalCart(productId, quantity, productData);
      }
    } else {
      console.warn('Skipping server sync due to invalid productId format. Using local cart only.', productId);
      updateLocalCart(productId, quantity, productData);
    }
  }, [cart.items]);

  // Helper function to update local cart state
  const updateLocalCart = useCallback((productId, quantity, productData) => {
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
        name: productData?.name || "Unknown Product",
        price: productData?.price || 0,
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
    localStorage.setItem('localCart', JSON.stringify(updatedCart));
    console.log('Cart updated locally as fallback', updatedCart);
  }, [cart.items]);

  // Remove from cart
  const removeFromCart = useCallback(async (productId) => {
    const userId = localStorage.getItem('userId');
    const guestId = getGuestId();
    const cartId = userId || guestId;
    
    // Always sync with server first for cross-browser persistence
    try {
      const res = await fetch(`${BASE_URL}/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: cartId, productId }),
      });
      
      if (res.ok) {
        // Update local state and localStorage
        const updatedItems = cart.items.filter(item => item.productId !== productId);
        const newTotalPrice = updatedItems.reduce((total, item) => 
          total + (item.price * item.quantity), 0);
        
        const updatedCart = {
          items: updatedItems,
          totalPrice: newTotalPrice
        };
        
        setCart(updatedCart);
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
        console.log('Item removed from server and localStorage updated');
      } else {
        console.error('Failed to remove from cart on server');
        // Fallback to local update if server fails
        const updatedItems = cart.items.filter(item => item.productId !== productId);
        const newTotalPrice = updatedItems.reduce((total, item) => 
          total + (item.price * item.quantity), 0);
        
        const updatedCart = {
          items: updatedItems,
          totalPrice: newTotalPrice
        };
        
        setCart(updatedCart);
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to local update if server fails
      const updatedItems = cart.items.filter(item => item.productId !== productId);
      const newTotalPrice = updatedItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0);
      
      const updatedCart = {
        items: updatedItems,
        totalPrice: newTotalPrice
      };
      
      setCart(updatedCart);
      localStorage.setItem('localCart', JSON.stringify(updatedCart));
    }
  }, [cart.items]);

  // Update item quantity
  const updateQuantity = useCallback(async (productId, nextQuantity) => {
    const userId = localStorage.getItem('userId');
    const guestId = getGuestId();
    const cartId = userId || guestId;
    const productIdString = typeof productId === 'string' ? productId : (typeof productId === 'object' ? productId._id : String(productId));
    const isValidHex24 = typeof productIdString === 'string' && /^[a-fA-F0-9]{24}$/.test(productIdString);
    
    // Always sync with server first for cross-browser persistence
    if (isValidHex24) {
      try {
        const res = await fetch(`${BASE_URL}/cart/update-quantity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: cartId, productId: productIdString, quantity: nextQuantity })
        });
        if (res.ok) {
          const data = await res.json();
          // Update cart with server response for cross-browser consistency
          const serverCart = data.cart || data;
          setCart(serverCart);
          // Also update localStorage to keep it in sync
          localStorage.setItem('localCart', JSON.stringify(serverCart));
          console.log('Server sync successful - cart updated from server and localStorage');
        } else {
          console.error('Failed to update quantity on server');
          // Fallback to local update if server fails
          updateLocalQuantity(productId, nextQuantity);
        }
      } catch (err) {
        console.error('Error updating quantity:', err);
        // Fallback to local update if server fails
        updateLocalQuantity(productId, nextQuantity);
      }
    } else {
      // Fallback to local update if productId is invalid
      updateLocalQuantity(productId, nextQuantity);
    }
  }, [cart.items]);

  // Helper function to update local quantity
  const updateLocalQuantity = useCallback((productId, nextQuantity) => {
    const updatedItems = cart.items.map(item =>
      item.productId === productId || (typeof item.productId === 'object' && item.productId._id === productId)
        ? { ...item, quantity: Math.max(0, nextQuantity) }
        : item
    ).filter(item => item.quantity > 0);

    const newTotalPrice = updatedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const updatedCart = { items: updatedItems, totalPrice: newTotalPrice };
    setCart(updatedCart);
    localStorage.setItem('localCart', JSON.stringify(updatedCart));
    console.log('Quantity updated locally as fallback', updatedCart);
  }, [cart.items]);

  // Checkout - create order from cart
  const checkout = useCallback(async () => {
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
  }, []);



  const cartCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);
  
  const contextValue = useMemo(() => ({
    cart, 
    addToCart, 
    removeFromCart, 
    checkout,
    updateQuantity,
    cartCount, 
    isLoading
  }), [cart, addToCart, removeFromCart, checkout, updateQuantity, cartCount, isLoading]);
  
  return (
    <CartContext.Provider value={contextValue}>
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


