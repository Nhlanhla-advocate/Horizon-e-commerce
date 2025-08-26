"use client";
import React from 'react';
import Image from 'next/image';
import { useCart } from './Cart';

export default function CartPage() {
    const { cart, removeFromCart, checkout, isLoading, updateQuantity } = useCart();

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
                        {cart.items.map((item) => {
                            const imageSrc = item.image || item?.productId?.images?.[0] || 
                                (typeof item?.productId === 'object' && item?.productId?.image) || '/next.svg';
                            const productKey = typeof item.productId === 'object' ? item.productId._id : item.productId;
                            return (
                                <li key={productKey} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                                    {imageSrc && (
                                        <div style={{ width: 80, height: 80, position: 'relative', flex: '0 0 80px' }}>
                                            <Image src={imageSrc} alt={item.name} fill style={{ objectFit: 'cover', borderRadius: 4 }} />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: 12, color: '#666' }}>Qty: {item.quantity}</div>
                                        </div>
                                        <CartItemControls productKey={productKey} quantity={item.quantity} price={item.price} onDecrease={() => updateQuantity(productKey, Math.max(0, item.quantity - 1))} onIncrease={() => updateQuantity(productKey, item.quantity + 1)} onRemove={() => removeFromCart(productKey)} />
                                    </div>
                                </li>
                            );
                        })}
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

function CartItemControls({ productKey, quantity, price, onDecrease, onIncrease, onRemove }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
                display: 'flex', alignItems: 'center', border: '1px solid #000', padding: '8px 12px', minWidth: 160, justifyContent: 'space-between'
            }}
            role="group"
            aria-label={`Quantity controls for product ${productKey}`}
            onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' || e.key === '-') onDecrease();
                if (e.key === 'ArrowRight' || e.key === '+') onIncrease();
            }}
            tabIndex={0}
            >
                <button aria-label="Decrease quantity" onClick={onDecrease} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>
                    <span aria-hidden>−</span>
                </button>
                <span aria-live="polite" style={{ fontWeight: 600 }}>{quantity}</span>
                <button aria-label="Increase quantity" onClick={onIncrease} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>
                    <span aria-hidden>+</span>
                </button>
            </div>
            <span>R {price.toFixed(2)}</span>
            <button onClick={onRemove}>Remove</button>
        </div>
    );
}


