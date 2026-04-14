"use client";
import React from 'react';
import Image from 'next/image';
import { useCart, normalizeProductId } from './Cart';
import '../../assets/css/cart.css';

const PLACEHOLDER_IMAGE = '/Pictures/placeholder.jpg';

/** Encode each path segment so spaces and special chars work with next/image and the browser. */
function normalizeImageSrc(src) {
    if (!src || typeof src !== 'string') return PLACEHOLDER_IMAGE;
    const trimmed = src.trim();
    if (!trimmed) return PLACEHOLDER_IMAGE;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const pathOnly = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const segments = pathOnly.split('/').filter(Boolean);
    if (segments.length === 0) return PLACEHOLDER_IMAGE;
    return `/${segments.map((seg) => encodeURIComponent(seg)).join('/')}`;
}

function resolveCartItemImageSrc(item) {
    if (item?.image && typeof item.image === 'string' && item.image.trim()) {
        return normalizeImageSrc(item.image);
    }
    const pid = item?.productId;
    if (pid && typeof pid === 'object') {
        if (Array.isArray(pid.images) && pid.images[0] && typeof pid.images[0] === 'string') {
            return normalizeImageSrc(pid.images[0]);
        }
        if (pid.image && typeof pid.image === 'string' && pid.image.trim()) {
            return normalizeImageSrc(pid.image);
        }
    }
    return PLACEHOLDER_IMAGE;
}

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
                            const imageSrc = resolveCartItemImageSrc(item);
                            
                            const productKey = normalizeProductId(item.productId) || `idx-${item.name}`;
                            return (
                                <li key={productKey} className="cart-item">
                                    <div className="cart-item-image">
                                        <Image 
                                            src={imageSrc} 
                                            alt={item.name || 'Product'} 
                                            fill 
                                            sizes="80px"
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
