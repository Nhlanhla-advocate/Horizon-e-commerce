'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/app/components/wishlist/Wishlist';
import { useCart, normalizeProductId } from '@/app/components/cart/Cart';
import { useLocale } from '@/app/i18n/LocaleProvider';
import {
  buildProductDetailHref,
  resolveProductPrimaryImage,
} from '@/app/utils/productGallery';
import '../../assets/css/wishlist.css';

const PLACEHOLDER = '/file.svg';

function WishlistItemImage({ product }) {
  const candidates = [
    resolveProductPrimaryImage(product),
    product?.image,
    Array.isArray(product?.images) ? product.images[0] : null,
  ].filter(Boolean);

  const unique = [...new Set(candidates.map(String))];
  const [src, setSrc] = useState(unique[0] || PLACEHOLDER);

  useEffect(() => {
    setSrc(unique[0] || PLACEHOLDER);
  }, [product?._id, product?.name, product?.image]);

  return (
    <img
      src={src}
      alt={product?.name || 'Product'}
      className="wishlist-item-img"
      onError={() => {
        const idx = unique.indexOf(src);
        const next =
          idx >= 0 && idx < unique.length - 1
            ? unique[idx + 1]
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
