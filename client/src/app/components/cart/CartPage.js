"use client";
import React, { useEffect, useState } from 'react';
import { useCart, normalizeProductId } from './Cart';
import '../../assets/css/cart.css';

const PLACEHOLDER_IMAGE = '/file.svg';

/** Encode each path segment so spaces and special chars work with next/image and the browser. */
function normalizeImageSrc(src) {
    if (!src || typeof src !== 'string') return PLACEHOLDER_IMAGE;
    const trimmed = src.trim().replace(/^['"]+|['"]+$/g, '');
    if (!trimmed) return PLACEHOLDER_IMAGE;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const pathOnly = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const segments = pathOnly.split('/').filter(Boolean);
    if (segments.length === 0) return PLACEHOLDER_IMAGE;
    return `/${segments.map((seg) => {
        try {
            return encodeURIComponent(decodeURIComponent(seg));
        } catch {
            return encodeURIComponent(seg);
        }
    }).join('/')}`;
}

function getPlaystationFallbacksByName(productName) {
    const normalizedName = String(productName || '').toLowerCase();
    if (!normalizedName) return [];

    if (normalizedName.includes('playstation 4') || normalizedName.includes('ps4')) {
        return [
            '/Pictures/Playstation 4.jpg',
            '/Pictures/Playstation4.jpg',
            '/Pictures/Playstation 4 Slim.jpg',
            '/Pictures/Playstation 4 pro.jpg',
            '/Pictures/Playstation 4 Pro.jpg'
        ];
    }

    if (normalizedName.includes('playstation 5') || normalizedName.includes('ps5')) {
        return [
            '/Pictures/Playstation 5.jpg',
            '/Pictures/Playstation 5 Digital.jpg',
            '/Pictures/Playstation 5 disk.jpg',
            '/Pictures/Playstation 5 pro.jpg'
        ];
    }

    return [];
}

function resolveCartItemImageCandidates(item) {
    const candidates = [];

    if (item?.image && typeof item.image === 'string' && item.image.trim()) {
        candidates.push(item.image);
    }

    const pid = item?.productId;
    if (pid && typeof pid === 'object') {
        if (Array.isArray(pid.images) && pid.images[0] && typeof pid.images[0] === 'string') {
            candidates.push(pid.images[0]);
        }
        if (pid.image && typeof pid.image === 'string' && pid.image.trim()) {
            candidates.push(pid.image);
        }
    }

    candidates.push(...getPlaystationFallbacksByName(item?.name));

    const normalized = candidates
        .map(normalizeImageSrc)
        .filter(Boolean);

    const unique = [...new Set(normalized)];
    return unique.length > 0 ? unique : [PLACEHOLDER_IMAGE];
}

function CartItemImage({ item }) {
    const imageCandidates = resolveCartItemImageCandidates(item);
    const [candidateIndex, setCandidateIndex] = useState(0);

    useEffect(() => {
        setCandidateIndex(0);
    }, [item?.name, item?.image, item?.productId]);

    const src = imageCandidates[candidateIndex] || PLACEHOLDER_IMAGE;

    return (
        <img
            src={src}
            alt={item?.name || 'Product'}
            style={{ objectFit: 'cover', borderRadius: 4, width: '100%', height: '100%' }}
            onError={() => {
                setCandidateIndex((prev) => {
                    if (prev < imageCandidates.length - 1) return prev + 1;
                    if (imageCandidates[prev] !== PLACEHOLDER_IMAGE) return imageCandidates.length;
                    return prev;
                });
            }}
        />
    );
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
                            const productKey = normalizeProductId(item.productId) || `idx-${item.name}`;
                            return (
                                <li key={productKey} className="cart-item">
                                    <div className="cart-item-image">
                                        <CartItemImage item={item} />
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
