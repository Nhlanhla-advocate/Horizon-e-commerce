'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { normalizeProductId } from '@/app/components/cart/Cart';
import {
  addToWishlist as apiAdd,
  fetchWishlist,
  removeFromWishlist as apiRemove,
} from '@/app/utils/wishlistApi';
import '../../assets/css/wishlist.css';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return ctx;
};

const readUserToken = () => {
  try {
    return Boolean(localStorage.getItem('token'));
  } catch {
    return false;
  }
};

export function WishListProvide({ children }) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const[pendingids, setPendingids] = useState(() => new Set());
  const router = useRouter();
  const pathname = usePathname();

  const syncAuth = useCallback(() => {
    setIsAuthed(readUserToken());
  }, []);

  const loadWishList = useCallback(async () => {
    if (!readUserToken()) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { products } = await fetchWishlist();
      setItems(products);
    } catch (err) {
      console.error("Wishlist load error:", err);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);