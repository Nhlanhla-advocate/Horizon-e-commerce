// "use client";
// import React, { createContext, useState, useContext, useEffect } from 'react';




// const CartContext = createContext();
// export const useCart = () => useContext(CartContext);
// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState({ items: [], totalPrice: 0 });


// //Fetch cart
// useEffect(() => {
//   const fetchCart = async () => {
//     const userId = localStorage.getItem('userId');
//     if (!userId) return;
//     try {
//       const res = await fetch(`/cart/${userId}`);
//       if(res.ok) {
//         const data = await res.json();
//         setCart(data);
//       }
//     } catch (err) {
//       console.error('Error fetching cart:', err);
//     }
//   };
//   fetchCart();
// }, []);


// //Add the product to the cart
// const addToCart = async (productId, quantity = 1) => {
//   const userId = localStorage.getItem('userId');
//   if(!userId) {
//     alert('No userId found in localStorage!');
//     return;
//   }
//   try {
//     const res = await fetch('/cart/add',{
//       method: 'POST',
//       headers: { 'Content-type': 'application/json' },
//       body:JSON.stringify({ userId, productId, quantity }),
//     });
//     console.log('Add to cart response:', res);
//     if (res.ok) {
//       const data = await res.json();
//       setCart(data);
//       alert('Added to cart!');
//     } else {
//       const error = await res.text();
//       alert('Failed to add to cart: ' + error);
//     }
//   } catch (err) {
//     console.error('Error adding to cart:', err);
//     alert('Error adding to cart: ' + err.message);
//   }
// };


// //Get item count
// const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
// return (
//   <CartContext.Provider value={{ cart, addToCart, cartCount }}>
//     {children}
//   </CartContext.Provider>
//   );
// };

"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/cart/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setCart(data);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCart();
  }, []);

  // Add the product to the cart
  const addToCart = async (productId, quantity = 1) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('No userId found in localStorage!');
      return;
    }
    try {
      const res = await fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity }),
      });
      console.log('Add to cart response:', res);
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        alert('Added to cart!');
      } else {
        const error = await res.text();
        alert('Failed to add to cart: ' + error);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Error adding to cart: ' + err.message);
    }
  };

  // Get item count
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const contextValue = {
    cart,
    addToCart,
    cartCount,
    isLoading
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};