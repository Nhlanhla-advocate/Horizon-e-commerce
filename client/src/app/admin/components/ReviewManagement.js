'use client';

import { useState, useEffect } from 'react';
import '../../assets/css/admin.css';
import '../../assets/css/reviewManagement.css';
import Pagination from './Pagination';

// Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function ReviewManagement() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
    });

    const [pagination, setPagination] = useState({});

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            
            const response = await fetch(`${BASE_URL}/dashboard/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            const fetchedProducts = data.data || [];
            setAllProducts(fetchedProducts);
            setProducts(fetchedProducts);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async (productId) => {
        try {
            setReviewsLoading(true);
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const queryParams = new URLSearchParams({
                page: filters.page,
                limit: filters.limit,
                sort: filters.sort,
                order: filters.order
            });
            
            const response = await fetch(`${BASE_URL}/dashboard/products/${productId}/reviews?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            if (data.success) {
                setReviews(data.data.reviews || []);
                setRatingStats(data.data.ratingStats);
                setPagination(data.data.pagination || {});
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching reviews:', err);
            setError(err.message);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchReviews(product._id);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/dashboard/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete review');
            }

            // Refresh reviews and products
            if (selectedProduct) {
                fetchReviews(selectedProduct._id);
                fetchProducts();
            }
        } catch (err) {
            console.error('Error deleting review:', err);
            setError(err.message);
        }
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    // Filter products based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setProducts(allProducts);
            return;
        }

        const queryLower = searchQuery.toLowerCase().trim();
        const filtered = allProducts.filter(product => {
            // For single character, check if it starts with that character
            if (queryLower.length === 1) {
                return (
                    product.name?.toLowerCase().startsWith(queryLower) ||
                    product.category?.toLowerCase().startsWith(queryLower) ||
                    product.description?.toLowerCase().startsWith(queryLower)
                );
            }
            // For longer queries, check if it contains the query
            return (
                product.name?.toLowerCase().includes(queryLower) ||
                product.category?.toLowerCase().includes(queryLower) ||
                product.description?.toLowerCase().includes(queryLower)
            );
        });
        setProducts(filtered);
        
        // Clear selected product if it's not in the filtered results
        if (selectedProduct && !filtered.find(p => p._id === selectedProduct._id)) {
            setSelectedProduct(null);
        }
    }, [searchQuery, allProducts]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchReviews(selectedProduct._id);
        }
    }, [filters, selectedProduct]);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < Math.round(rating) ? '#fbbf24' : '#d1d5db' }}>
                ★
            </span>
        ));
    };

    return (
        <div className="review-management-container">
            <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                <div>
                    <h2 className="review-management-title">Review Management</h2>
                    <p className="review-management-subtitle">Manage product reviews and ratings.</p>
                </div>

                {/* Search Bar */}
                <div className="review-management-search-container">
                    <div className="review-management-search-wrapper">
                        <svg 
                            className="review-management-search-icon" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <input
                            type="text"
                            className="review-management-search-input"
                            placeholder="Search products by name, category, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="review-management-search-clear"
                                onClick={() => setSearchQuery('')}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}

            <div className="review-management-grid">
                {/* Products List */}
                <div className="review-management-products-column">
                    <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                        <h3 className="review-management-section-title">Products</h3>
                        {loading ? (
                            <div className="review-management-loading">
                                <div className="admin-spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#2563eb' }}></div>
                            </div>
                        ) : products.length === 0 ? (
                            <p className="review-management-empty">No products found</p>
                        ) : (
                            <div className="review-management-products-list">
                                {products.map((product) => (
                                    <button
                                        key={product._id}
                                        onClick={() => handleProductSelect(product)}
                                        className={`review-management-product-button ${
                                            selectedProduct?._id === product._id
                                                ? 'review-management-product-button-selected'
                                                : 'review-management-product-button-unselected'
                                        }`}
                                        style={{
                                            borderRadius: '0.5rem'
                                        }}
                                    >
                                        <div className="review-management-product-content">
                                            <div className="review-management-product-info">
                                                <div className={`review-management-product-name ${
                                                    selectedProduct?._id === product._id 
                                                        ? 'review-management-product-name-selected' 
                                                        : 'review-management-product-name-unselected'
                                                }`}>
                                                    {product.name}
                                                </div>
                                                <div className={`review-management-product-rating ${
                                                    selectedProduct?._id === product._id 
                                                        ? 'review-management-product-rating-selected' 
                                                        : 'review-management-product-rating-unselected'
                                                }`}>
                                                    {product.rating ? (
                                                        <div className="review-management-product-rating-container">
                                                            {renderStars(product.rating)}
                                                            <span className="review-management-product-rating-count">({product.numReviews || 0} reviews)</span>
                                                        </div>
                                                    ) : (
                                                        <span>No reviews yet</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`review-management-product-icon ${
                                                selectedProduct?._id === product._id 
                                                    ? 'review-management-product-icon-selected' 
                                                    : 'review-management-product-icon-unselected'
                                            }`}>
                                                <span className="review-management-product-icon-star">⭐</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="review-management-reviews-column">
                    {selectedProduct ? (
                        <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                            <div className="review-management-reviews-header">
                                <div>
                                    <h3 className="review-management-reviews-title">{selectedProduct.name}</h3>
                                    {ratingStats && (
                                        <div className="review-management-rating-stats">
                                            <div className="review-management-rating-stats-container">
                                                <span className="review-management-rating-average">
                                                    {ratingStats.averageRating?.toFixed(1) || '0.0'}
                                                </span>
                                                <div className="review-management-rating-stars">{renderStars(ratingStats.averageRating || 0)}</div>
                                                <span className="review-management-rating-count">
                                                    ({ratingStats.totalReviews || 0} reviews)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="admin-btn admin-btn-secondary"
                                    style={{ fontSize: '0.875rem' }}
                                >
                                    Back to Products
                                </button>
                            </div>

                            {reviewsLoading ? (
                                <div className="review-management-loading">
                                    <div className="admin-spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#2563eb' }}></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <p className="review-management-empty">No reviews found for this product</p>
                            ) : (
                                <>
                                    <div className="review-management-reviews-list">
                                        {reviews.map((review) => (
                                            <div key={review._id} className="review-management-review-card">
                                                <div className="review-management-review-content">
                                                    <div className="review-management-review-main">
                                                        <div className="review-management-review-header">
                                                            <div className="review-management-review-username">
                                                                {review.user?.username || 'Anonymous'}
                                                            </div>
                                                            <div className="review-management-rating-stars">{renderStars(review.rating)}</div>
                                                            <span className="review-management-review-date">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="review-management-review-comment">{review.comment}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="admin-btn admin-btn-danger review-management-review-delete"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {pagination.pages > 1 && (
                                        <div className="review-management-pagination">
                                            <Pagination
                                                pagination={pagination}
                                                onPageChange={handlePageChange}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                            <div className="review-management-empty-state">
                                <p className="review-management-empty-state-text">Select a product to view its reviews</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}