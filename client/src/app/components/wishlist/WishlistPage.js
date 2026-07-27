'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/app/components/wishlist/Wishlist';
import { useCart, normalizeProductId } from '@/app/components/cart/Cart';
import { useLocale } from '@/app/i18n/LocaleProvider';
import {
  buildProductDetailHref,
  normalizeProductImagePath,
  resolveProductPrimaryImage,
} from '@/app/utils/productGallery';
import '../../assets/css/wishlist.css';

const PLACEHOLDER = '/file.svg';

/** Encode path segments so spaces/special chars load (same approach as cart). */
function encodeImageSrc(src) {
  if (!src || typeof src !== 'string') return PLACEHOLDER;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;

  const pathOnly = src.startsWith('/') ? src : `/${src}`;
  const segments = pathOnly.split('/').filter(Boolean);
  if (segments.length === 0) return PLACEHOLDER;

  return `/${segments
    .map((seg) => {
      try {
        return encodeURIComponent(decodeURIComponent(seg));
      } catch {
        return encodeURIComponent(seg);
      }
    })
    .join('/')}`;
}

function resolveWishlistImageCandidates(product) {
  const candidates = [];

  if (Array.isArray(product?.images) && product.images[0]) {
    candidates.push(product.images[0]);
  }
  if (product?.image) {
    candidates.push(product.image);
  }
  if (product?.name) {
    candidates.push(product.name);
    candidates.push(String(product.name).replace(/\bnecklace\b/gi, 'necklaces'));
  }

  const normalized = candidates
    .map((value) => encodeImageSrc(normalizeProductImagePath(value) || String(value || '')))
    .filter((src) => src && src !== PLACEHOLDER);

  const unique = [...new Set(normalized)];
  return unique.length > 0 ? unique : [PLACEHOLDER];
}

function WishlistItemImage({ product }) {
  const imageCandidates = useMemo(
    () => resolveWishlistImageCandidates(product),
    [product?._id, product?.name, product?.image, product?.images]
  );
  const [src, setSrc] = useState(imageCandidates[0] || PLACEHOLDER);

  useEffect(() => {
    setSrc(imageCandidates[0] || PLACEHOLDER);
  }, [imageCandidates]);

  return (
    <img
      src={src}
      alt={product?.name || 'Product'}
      className="wishlist-item-img"
      onError={() => {
        const idx = imageCandidates.indexOf(src);
        const next =
          idx >= 0 && idx < imageCandidates.length - 1
            ? imageCandidates[idx + 1]
            : PLACEHOLDER;

        if (next !== src) setSrc(next);
      }}
    />
  );
}

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist, isPending } = useWishlist();
  const { addToCart } = useCart();
  const { t, formatPrice } = useLocale();

  if (isLoading) {
    return (
      <div className="wishlist-container">
        <p className="wishlist-loading">{t('wishlist.loading')}</p>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <h2 className="wishlist-title">{t('wishlist.title')}</h2>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <p>{t('wishlist.empty')}</p>
          <Link href="/products" className="wishlist-continue-shopping">
            {t('wishlist.continueShopping')}
          </Link>
        </div>
      ) : (
        <ul className="wishlist-items-list">
          {items.map((product) => {
            const productId = normalizeProductId(product?._id || product);
            const href = buildProductDetailHref(product);
            const pending = isPending(productId);
            const imageSrc = resolveProductPrimaryImage(product);

            return (
              <li key={productId || product?.name} className="wishlist-item">
                <Link href={href} className="wishlist-item-image">
                  <WishlistItemImage product={product} />
                </Link>

                <div className="wishlist-item-details">
                  <div className="wishlist-item-info">
                    <Link href={href} className="wishlist-item-name">
                      {product.name}
                    </Link>
                    {product.description && (
                      <p className="wishlist-item-desc">{product.description}</p>
                    )}
                    <div className="wishlist-item-price">
                      {formatPrice(Number(product.price ?? 0))}
                    </div>
                  </div>

                  <div className="wishlist-item-actions">
                    <button
                      type="button"
                      className="wishlist-add-cart-btn"
                      disabled={pending}
                      onClick={() => {
                        if (!productId) return;
                        addToCart(productId, 1, {
                          name: product.name,
                          price: product.price,
                          image: imageSrc,
                          description: product.description,
                        });
                      }}
                    >
                      {t('product.addToCart')}
                    </button>
                    <button
                      type="button"
                      className="wishlist-remove-btn"
                      disabled={pending}
                      onClick={() => removeFromWishlist(productId)}
                    >
                      {t('wishlist.remove')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}