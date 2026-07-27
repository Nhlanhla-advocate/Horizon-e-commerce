'use client';

import React from 'react';
import { FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa';
import { useWishlist } from '@/app/components/wishlist/Wishlist';
import { useLocale } from '@/app/i18n/LocaleProvider';

/**
 * Heart toggle for product cards and product detail.
 * Stops propagation so card Links do not navigate on click.
 */
export default function WishlistHeartButton({
  productId,
  className = '',
  variant = 'overlay',
  showLabel = false,
}) {
  const { isInWishlist, isPending, toggleWishlist } = useWishlist();
  const { t } = useLocale();
  const active = isInWishlist(productId);
  const pending = isPending(productId);

  const label = active ? t('wishlist.remove') : t('wishlist.add');
  const classes = [
    'wishlist-heart-btn',
    wishlist-heart-btn--${variant},
    active ? 'wishlist-heart-btn--active' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');