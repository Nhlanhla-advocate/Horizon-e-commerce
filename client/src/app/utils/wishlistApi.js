import { fetchWithUserAuth } from '@/app/utils/userAuthFetch';

function normalizeProducts(payload) {
  if (!payload) return [];
  const products = payload.products ?? payload.wishlist?.products;
  return Array.isArray(products) ? products.filter(Boolean) : [];
}

/**
 * GET /wishlist — 404 means empty wishlist (no document yet).
 */
export async function fetchWishlist() {
  const res = await fetchWithUserAuth('/wishlist');

  if (res.status === 404) {
    return { products: [] };
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to load wishlist');
  }

  return { products: normalizeProducts(data) };
}

export async function addToWishlist(productId) {
  const res = await fetchWithUserAuth('/wishlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to add to wishlist');
  }

  return {
    products: normalizeProducts(data.wishlist || data),
    raw: data,
  };
}

export async function removeFromWishlist(productId) {
  const res = await fetchWithUserAuth('/wishlist', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Failed to remove from wishlist');
  }

  return {
    products: normalizeProducts(data.wishlist || data),
    raw: data,
  };
}
