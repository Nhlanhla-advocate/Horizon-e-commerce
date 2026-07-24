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

  useEffect(() => {
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('horizon-auth-change', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('horizon-auth-change', syncAuth);
    };
  }, [syncAuth]);

  useEffect(() => {
    if (isAuthed) {
      loadWishlist();
    } else {
      setItems([]);
      setIsLoading(false);
    }
  }, [isAuthed, loadWishlist]);

  const wishlistIds = useMemo(() => {
    const ids = new Set();
    for (const product of items) {
      const id = normalizeProductId(product?._id || product);
      if (id) ids.add(id);
    }
    return ids;
  }, [items]);

  const wishlistCount = wishlistIds.size;

  const isInWishlist = useCallback(
    (productId) => {
      const id = normalizeProductId(productId);
      return Boolean(id && wishlistIds.has(id));
    },
    [wishlistIds]
  );

  const requireAuth = useCallback(() => {
    const redirect = pathname && pathname !== '/auth/signin'
      ? `?redirect=${encodeURIComponent(pathname)}`
      : '';
    router.push(/auth/signin${redirect});
  }, [pathname, router]);

  const setPending = useCallback((productId, pending) => {
    const id = normalizeProductId(productId);
    if (!id) return;
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    const id = normalizeProductId(productId);
    if (!id) return { ok: false };

    if (!readUserToken()) {
      requireAuth();
      return { ok: false, needsAuth: true };
    }

    setPending(id, true);
    try {
      const { products } = await apiRemove(id);
      setItems(products);
      return { ok: true };
    } catch (err) {
      console.error('Remove from wishlist failed:', err);
      return { ok: false, error: err?.message };
    } finally {
      setPending(id, false);
    }
  }, [requireAuth, setPending]);

  const toggleWishlist = useCallback(async (productId) => {
    const id = normalizeProductId(productId);
    if (!id) return { ok: false };

    if (!readUserToken()) {
      requireAuth();
      return { ok: false, needsAuth: true };
    }
