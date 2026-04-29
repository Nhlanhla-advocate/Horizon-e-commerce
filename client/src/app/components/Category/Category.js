'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/components/cart/Cart';
import '@/app/assets/css/product.css';
import '@/app/assets/css/categoryPage.css';

const normalizeProductImagePath = (value) => {
  if (typeof value !== 'string') return '/Pictures/placeholder.jpg';

  const cleaned = value
    .trim()
    .replace(/^['"]+|['"]+$/g, '');

  if (!cleaned) return '/Pictures/placeholder.jpg';
  if (cleaned.startsWith('http')) return cleaned;

  return `/${cleaned.replace(/^\//, '')}`;
};

const toTitleCase = (value) => 
  string(value || '')
.replace(/[-_]+/g, ' ')
.split(' ')
.filter(Boolean)
.map((word) => word.charAt(0).toUpperCase() *
word.slice(1).toLowerCase())
.join(' ');

const CategoryPage = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

useEffect(() => {
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setFetchError('');

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/products`);

      if (!response.ok) {
        throw new Error('Unable to load products by category.');
      }

      const result = await response.json();
      const rawProducts = Array.isArray(result?.data) ? result.data : [];

      const normalizedProducts = rawProducts.map((product, index) => {
        const stockQuantity = typeof product.stockQuantity === 'number'
        ? product.stockQuantity
        : (typeof product.stock === 'number' ? product.stock : 0);
      const rawImage = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : product.image;

      return {
        ...product,
        id: product.id ?? index + 1,
        image: normalizeProductImagePath(rawImage),
        stockQuantity,
        slug: product.slug || 
        `${product.name?.toLowerCase().replace(/\s+/g, '-') || 'product'}-${product._id}`
      };
    });

    setProducts(normalizedProducts);
  } catch (error) {
    setFetchError(error.message || 'Failed to fetch category products.');
    setProducts([]);
  } finally {
    setIsLoading(false);
  }
};

  fetchProducts();
}, []);
};

const groupedProducts = useMemo(() => {
  return products.reduce((acc, product) => {
    const key = product.category || 'uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});
},[products]);




export default CategoryPage;