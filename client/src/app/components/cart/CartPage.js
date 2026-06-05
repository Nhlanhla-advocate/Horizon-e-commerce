"use client";
import React, { useEffect, useState } from 'react';
import { useCart, normalizeProductId } from './Cart';
import { useLocale } from '@/app/i18n/LocaleProvider';
import '../../assets/css/cart.css';

const PLACEHOLDER_IMAGE = '/file.svg';

/** Encode each path segment so spaces and special chars work with next/image and the browser. */
function normalizeImageSrc(src) {
    if (!src || typeof src !== 'string') return PLACEHOLDER_IMAGE;
    const trimmed = src
        .trim()
        .replace(/^['"]+|['"]+$/g, '')
        .replace(/[,\s]+$/g, '');
    if (!trimmed) return PLACEHOLDER_IMAGE;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const normalized = trimmed
        .replace(/\\/g, '/')
        .replace(/^\.\//, '')
        .replace(/^client\/public\//i, '')
        .replace(/^public\//i, '')
        .replace(/^\//, '');
    const hasFileExtension = /\.[a-z0-9]{2,5}$/i.test(
        normalized.split('?')[0].split('#')[0].split('/').pop() || ''
    );
    const normalizedWithExtension = hasFileExtension ? normalized : `${normalized}.jpg`;
    const pathOnly = /^pictures\//i.test(normalizedWithExtension)
        ? `/${normalizedWithExtension}`
        : (!normalizedWithExtension.includes('/') ? `/Pictures/${normalizedWithExtension}` : `/${normalizedWithExtension}`);
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

    if (item?.name && typeof item.name === 'string') {
        candidates.push(item.name);
        candidates.push(item.name.replace(/\bnecklace\b/gi, 'necklaces'));
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
    const [src, setSrc] = useState(imageCandidates[0] || PLACEHOLDER_IMAGE);

    useEffect(() => {
        setSrc(imageCandidates[0] || PLACEHOLDER_IMAGE);
    }, [item?.name, item?.image, item?.productId]);

    return (
        <img
            src={src}
            alt={item?.name || 'Product'}
            style={{ objectFit: 'cover', borderRadius: 4, width: '100%', height: '100%' }}
            onError={() => {
                const currentIndex = imageCandidates.indexOf(src);
                const hasNext = currentIndex >= 0 && currentIndex < imageCandidates.length - 1;
                const nextSrc = hasNext ? imageCandidates[currentIndex + 1] : PLACEHOLDER_IMAGE;
                if (nextSrc !== src) setSrc(nextSrc);
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
    const { t, formatPrice } = useLocale();
    const cartItems = Array.isArray(cart?.items) ? cart.items : [];
    const cartTotal = Number(cart?.totalPrice ?? 0);

    if (isLoading) {
        return <div className="cart-container">{t('cart.loading')}</div>;
    }

    return (
        <div className="cart-container">
            <h2 className="cart-title">{t('cart.title')}</h2>
            {cartItems.length === 0 ? (
                <div className="cart-empty">
                    <p>{t('cart.empty')}</p>
                    <a href="/products" className="cart-continue-shopping">{t('cart.continueShopping')}</a>
                </div>
            ) : (
                <div className="cart-content">
                    <ul className="cart-items-list">
                        {cartItems.map((item) => {
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
                                            formatPrice={formatPrice}
                                            t={t}
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
                <strong>{t('cart.total')}</strong>
                <strong>{formatPrice(cartTotal)}</strong>
            </div>
            

            
            <button className="cart-checkout-button" onClick={checkout}>
                {t('cart.checkout')}
            </button>
        </div>
                </div>
            )}
        </div>
    );
}

function CartItemControls({ productKey, quantity, price, totalPrice, formatPrice, t, onDecrease, onIncrease, onRemove }) {
    const safeUnitPrice = Number(price ?? 0);
    const safeTotalPrice = Number(totalPrice ?? safeUnitPrice * Number(quantity ?? 0));

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
                <span className="cart-item-unit-price">{formatPrice(safeUnitPrice)} {t('cart.each')}</span>
                <span className="cart-item-total-price">{formatPrice(safeTotalPrice)}</span>
            </div>
            <button className="cart-remove-button" onClick={onRemove}>Remove</button>
        </div>
    );
}
