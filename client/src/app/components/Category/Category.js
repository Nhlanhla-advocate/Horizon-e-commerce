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
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
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
            : typeof product.stock === 'number'
              ? product.stock
              : 0;
          const rawImage = Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : product.image;

          return {
            ...product,
            id: product.id ?? index + 1,
            image: normalizeProductImagePath(rawImage),
            stockQuantity,
            slug:
              product.slug ||
              `${product.name?.toLowerCase().replace(/\s+/g, '-') || 'product'}-${product._id}`,
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

  const groupedProducts = useMemo(() => {
    return products.reduce((acc, product) => {
      const key = String(product.category || 'uncategorized')
        .trim()
        .toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {});
  }, [products]);

  const sortedCategoryNames = useMemo(
    () => Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b)),
    [groupedProducts]
  );

  const formatPrice = (price) =>
    `R ${Number(price || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  return (
    <div className="products-page-container category-page-container">
      <div className="page-header">
        <h1 className="page-title">Shop by Category</h1>
        <p className="page-description">Products grouped by category from your database.</p>
      </div>

      {isLoading && (
        <div className="empty-state">
          <h3>Loading category products...</h3>
        </div>
      )}

      {!isLoading && fetchError && (
        <div className="empty-state">
          <h3>Could not load categories</h3>
          <p>{fetchError}</p>
        </div>
      )}

      {!isLoading && !fetchError && sortedCategoryNames.length === 0 && (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Add products to your database and they will appear here grouped by category.</p>
        </div>
      )}

      {!isLoading &&
        !fetchError &&
        sortedCategoryNames.map((categoryName) => (
          <section key={categoryName} className="category-section">
            <h2 className="category-title">{toTitleCase(categoryName)}</h2>
            <div className="products-grid category-products-grid">
              {groupedProducts[categoryName].map((product) => (
                <article key={product._id || product.id} className="product-card">
                  <div className="product-image-container">
                    <Link href={`/products/${product.slug}`}>
                      <div className="image-wrapper">
                        <Image
                          src={product.image}
                          alt={product.name}
                          className="product-image"
                          width={250}
                          height={250}
                          style={{ objectFit: 'cover' }}
                        />
                        {product.stockQuantity === 0 && (
                          <div className="out-of-stock-badge">Out of Stock</div>
                        )}
                      </div>
                    </Link>
                  </div>

                  <div className="product-info">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="product-name">{product.name}</h3>
                    </Link>
                    <div className="product-category">{toTitleCase(product.category)}</div>
                    <div className="product-price">{formatPrice(product.price)}</div>
                    <div className="product-stock">
                      {product.stockQuantity > 0 ? (
                        <span className="in-stock">{product.stockQuantity} in stock</span>
                      ) : (
                        <span className="out-of-stock">Out of stock</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="add-to-cart-button"
                      onClick={() =>
                        addToCart(product._id, 1, {
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          description: product.description,
                          category: product.category,
                        })
                      }
                      disabled={product.stockQuantity === 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
};


export default CategoryPage;