'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/app/components/cart/Cart';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

const Products = () => {
    const { addToCart } = useCart();
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
                const response = await fetch(`${baseUrl}/products`);

                if (!response.ok) {
                    throw new Error('Unable to load featured products.');
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
                    const imageCandidate = typeof rawImage === 'string' ? rawImage.trim() : '';
                    const image = imageCandidate
                        ? (imageCandidate.startsWith('http') ? imageCandidate : `/${imageCandidate.replace(/^\//, '')}`)
                        : '/Pictures/placeholder.jpg';
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
    const filteredProducts = products.filter(product => {
        if (!searchQuery) return true;
        
        const searchTerm = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    });

    // Format price function (same as products page)
    const formatPrice = (price) => {
        return `R ${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

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
                <h1 className="page-title">Featured Products</h1>
                <p className="page-description">Discover our most popular gaming products</p>
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
                                placeholder="Search products..."
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
            
            <div className="products-grid">
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
                <>
                {filteredProducts.map((product) => {
                    return (
                        <div key={product.id} className="product-card">
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
                                <div className="product-category">{product.category}</div>
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
                                        <span>Add to Cart</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    );
                })}
                </>
                )}
            </div>

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