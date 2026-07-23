'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/components/cart/Cart';
import { useLocale } from '@/app/i18n/LocaleProvider';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { productMatchesSearchQuery } from '@/app/utils/productSearch';
import WishlistHeartButton from '@/app/components/wishlist/WishlistHeartButton';

const normalizeProductImagePath = (value) => {
    if (typeof value !== 'string') return '/Pictures/placeholder.jpg';

    const cleaned = value
        .trim()
        .replace(/^['"]+|['"]+$/g, '');

    if (!cleaned) return '/Pictures/placeholder.jpg';
    if (cleaned.startsWith('http')) return cleaned;

    const normalized = cleaned
        .replace(/\\/g, '/')
        .replace(/^\.\//, '')
        .replace(/^client\/public\//i, '')
        .replace(/^public\//i, '')
        .replace(/^\//, '');

    const hasFileExtension = /\.[a-z0-9]{2,5}$/i.test(
        normalized.split('?')[0].split('#')[0].split('/').pop() || ''
    );
    const normalizedWithExtension = hasFileExtension ? normalized : `${normalized}.jpg`;

    if (/^pictures\//i.test(normalizedWithExtension)) return `/${normalizedWithExtension}`;
    if (!normalizedWithExtension.includes('/')) return `/Pictures/${normalizedWithExtension}`;
    return `/${normalizedWithExtension}`;
};

const Products = () => {
    const { addToCart } = useCart();
    const { t, formatPrice } = useLocale();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    // Read search parameter from URL on component mount
    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (urlSearch) {
            setSearchQuery(urlSearch);
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                setFetchError('');
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const initialResponse = await fetch(`${baseUrl}/products?page=1&limit=100`);
                if (!initialResponse.ok) {
                    throw new Error('Unable to load featured products.');
                }

                const initialResult = await initialResponse.json();
                const totalPages = Number(initialResult?.pagination?.pages || 1);
                const allRawProducts = Array.isArray(initialResult?.data) ? [...initialResult.data] : [];

                if (totalPages > 1) {
                    const pageRequests = Array.from({ length: totalPages - 1 }, (_, idx) =>
                        fetch(`${baseUrl}/products?page=${idx + 2}&limit=100`).then((response) => {
                            if (!response.ok) {
                                throw new Error('Unable to load featured products.');
                            }
                            return response.json();
                        })
                    );

                    const remainingPageResults = await Promise.all(pageRequests);
                    remainingPageResults.forEach((pageResult) => {
                        if (Array.isArray(pageResult?.data)) {
                            allRawProducts.push(...pageResult.data);
                        }
                    });
                }

                const normalizedProducts = allRawProducts.map((product, index) => {
                    const stockQuantity = typeof product.stockQuantity === 'number'
                        ? product.stockQuantity
                        : (typeof product.stock === 'number' ? product.stock : 0);
                    const rawImage = Array.isArray(product.images) && product.images.length > 0
                        ? product.images[0]
                        : product.image;
                    const image = normalizeProductImagePath(rawImage);
                    const slugBase = product.slug || (product.name?.toLowerCase().replace(/\s+/g, '-') || 'product');

                    return {
                        ...product,
                        id: product.id ?? index + 1,
                        stockQuantity,
                        image,
                        slug: `${slugBase}-${product._id}`
                    };
                });

                setProducts(normalizedProducts);
            } catch (error) {
                setFetchError(error.message || 'Failed to fetch featured products.');
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter products based on search query (same logic as products page)
    const filteredProducts = products.filter((product) =>
        productMatchesSearchQuery(product, searchQuery)
    );

    const productsByCategory = useMemo(() => {
        return filteredProducts.reduce((acc, product) => {
            const rawCategory = String(product.category || 'Other').trim().toLowerCase();
            const categoryKey =
                rawCategory === 'console' || rawCategory === 'consoles'
                    ? 'consoles'
                    : rawCategory === 'watch' || rawCategory === 'watches'
                        ? 'watches'
                        : rawCategory === 'jewellery'
                            ? 'jewelry'
                            : (rawCategory || 'other');
            if (!acc[categoryKey]) acc[categoryKey] = [];
            acc[categoryKey].push(product);
            return acc;
        }, {});
    }, [filteredProducts]);

    const sortedCategories = useMemo(
        () => Object.keys(productsByCategory).sort((a, b) => a.localeCompare(b)),
        [productsByCategory]
    );

    const featuredProducts = useMemo(
        () => sortedCategories.flatMap((categoryName) => productsByCategory[categoryName].slice(0, 4)),
        [productsByCategory, sortedCategories]
    );

    const handleSearch = (e) => {
        e.preventDefault();
        // Search is handled by the filter, no need to navigate
    };

    const clearSearch = () => {
        setSearchQuery('');
        // Update URL to remove search parameter
        const url = new URL(window.location);
        url.searchParams.delete('search');
        window.history.replaceState({}, '', url);
    };

    return (
        <div className="products-page-container">
            <div className="page-header">
                <h1 className="page-title">{t('home.featured.title')}</h1>
                <p className="page-description">{t('home.featured.desc')}</p>
            </div>

            {/* Search Section */}
            <div className="products-controls">
                <div className="search-box">
                    <form onSubmit={handleSearch} className="navbar-search-wrapper">
                        <div className="navbar-search-relative">
                            <div className="navbar-search-icon">
                                <FaSearch />
                            </div>
                            <input
                                className="navbar-search-input"
                                placeholder={t('product.search')}
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="navbar-search-clear"
                                    onClick={clearSearch}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#666',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            
            {isLoading && (
                <div className="empty-state">
                    <h3>Loading featured products...</h3>
                </div>
            )}
            {!isLoading && fetchError && (
                <div className="empty-state">
                    <h3>Could not load featured products</h3>
                    <p>{fetchError}</p>
                </div>
            )}
            {!isLoading && !fetchError && (
                <div className="products-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                    {featuredProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-image-container">
                                <WishlistHeartButton productId={product._id} variant="overlay" />
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
                                            <div className="out-of-stock-badge">{t('product.outOfStockBadge')}</div>
                                        )}
                                    </div>
                                </Link>
                            </div>
                            <div className="product-info">
                                <Link href={`/products/${product.slug}`}>
                                    <h3 className="product-name">{product.name}</h3>
                                </Link>
                                <div className="product-price">{formatPrice(product.price)}</div>
                                <div className="product-stock">
                                    {product.stockQuantity > 0 ? (
                                        <span className="in-stock">{t('product.inStock', { count: product.stockQuantity })}</span>
                                    ) : (
                                        <span className="out-of-stock">{t('product.outOfStock')}</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="add-to-cart-button"
                                    onClick={() => {
                                        addToCart(
                                            product._id,
                                            1,
                                            {
                                                name: product.name,
                                                price: product.price,
                                                image: product.image,
                                                description: product.description,
                                                category: product.category
                                            }
                                        );
                                    }}
                                    disabled={product.stockQuantity === 0}
                                >
                                    <span className="button-content">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="cart-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                        </svg>
                                        <span>{t('product.addToCart')}</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Show message when no products found */}
            {filteredProducts.length === 0 && searchQuery && (
                <div className="empty-state">
                    <h3>No products found</h3>
                    <p>Try adjusting your search terms or browse all our products.</p>
                    <button 
                        onClick={clearSearch}
                        className="reset-filters-button"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
};

export default Products;