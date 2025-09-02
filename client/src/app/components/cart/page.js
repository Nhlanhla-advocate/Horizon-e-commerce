"use client";
import React from 'react';
import Image from 'next/image';
import { useCart } from './Cart';
import '../../assets/css/cart.css';

export default function CartPage() {
    const { 
        cart, 
        removeFromCart, 
        checkout, 
        isLoading, 
        updateQuantity
    } = useCart();

    if (isLoading) {
        return <div className="cart-container">Loading cart...</div>;
    }

    return (
        <div className="cart-container">
            <h2 className="cart-title">Your Cart</h2>
            {cart.items.length === 0 ? (
                <div className="cart-empty">
                    <p>Your cart is empty.</p>
                    <a href="/products" className="cart-continue-shopping">Continue Shopping</a>
                </div>
            ) : (
                <div className="cart-content">
                    <ul className="cart-items-list">
                        {cart.items.map((item) => {
                            // Handle different image source possibilities
                            let imageSrc = '/next.svg'; // Default fallback
                            
                            if (item.image) {
                                // Direct image path from cart item
                                imageSrc = item.image;
                            } else if (item?.productId?.images?.[0]) {
                                // From populated product data
                                imageSrc = item.productId.images[0];
                            } else if (typeof item?.productId === 'object' && item?.productId?.image) {
                                // From populated product data (alternative field)
                                imageSrc = item.productId.image;
                            }
                            
                            const productKey = typeof item.productId === 'object' ? item.productId._id : item.productId;
                            return (
                                <li key={productKey} className="cart-item">
                                    <div className="cart-item-image">
                                        <Image 
                                            src={imageSrc} 
                                            alt={item.name || 'Product'} 
                                            fill 
                                            style={{ objectFit: 'cover', borderRadius: 4 }} 
                                        />
                                    </div>
                                    <div className="cart-item-details">
                                        <div className="cart-item-info">
                                            <div className="cart-item-name">{item.name}</div>
                                            <div className="cart-item-quantity">Qty: {item.quantity}</div>
                                        </div>
                                        <CartItemControls 
                                            productKey={productKey} 
                                            quantity={item.quantity} 
                                            price={item.price} 
                                            totalPrice={item.price * item.quantity}
                                            onDecrease={() => updateQuantity(productKey, Math.max(0, item.quantity - 1))} 
                                            onIncrease={() => updateQuantity(productKey, item.quantity + 1)} 
                                            onRemove={() => removeFromCart(productKey)} 
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                            <div className="cart-summary">
            <div className="cart-total">
                <strong>Total:</strong>
                <strong>R {cart.totalPrice.toFixed(2)}</strong>
            </div>
            

            
            <button className="cart-checkout-button" onClick={checkout}>
                Checkout
            </button>
        </div>
                </div>
            )}
        </div>
    );
}

function CartItemControls({ productKey, quantity, price, totalPrice, onDecrease, onIncrease, onRemove }) {
    return (
        <div className="cart-item-controls">
            <div className="quantity-controls"
                role="group"
                aria-label={`Quantity controls for product ${productKey}`}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft' || e.key === '-') onDecrease();
                    if (e.key === 'ArrowRight' || e.key === '+') onIncrease();
                }}
                tabIndex={0}
            >
                <button 
                    className="quantity-btn quantity-decrease" 
                    aria-label="Decrease quantity" 
                    onClick={onDecrease}
                >
                    <span aria-hidden>−</span>
                </button>
                <span className="quantity-display" aria-live="polite">{quantity}</span>
                <button 
                    className="quantity-btn quantity-increase" 
                    aria-label="Increase quantity" 
                    onClick={onIncrease}
                >
                    <span aria-hidden>+</span>
                </button>
            </div>
            <div className="cart-item-price-info">
                <span className="cart-item-unit-price">R {price.toFixed(2)} each</span>
                <span className="cart-item-total-price">R {totalPrice.toFixed(2)}</span>
            </div>
            <button className="cart-remove-button" onClick={onRemove}>Remove</button>
        </div>
    );
}


