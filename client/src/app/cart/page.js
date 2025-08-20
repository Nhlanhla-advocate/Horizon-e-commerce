"use client";
import React from 'react';
import { useCart } from '../components/cart/Cart';

export default function CartPage() {
    const { cart, removeFromCart, checkout, isLoading } = useCart();

    if (isLoading) {
        return <div className="container">Loading cart...</div>;
    }

    return (
        <div className="container">
            <h2>Your Cart</h2>
            {cart.items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <ul>
                        {cart.items.map((item) => (
                            <li key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>R {item.price.toFixed(2)}</span>
                                <button onClick={() => removeFromCart(item.productId)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                        <strong>Total:</strong>
                        <strong>R {cart.totalPrice.toFixed(2)}</strong>
                    </div>
                    <button className="button" onClick={checkout} style={{ marginTop: 16 }}>Checkout</button>
                </div>
            )}
        </div>
    );
}


