'use client';

import { useState, useEffect } from 'react';
import '../../assets/css/admin.css';
import Pagination from './Pagination';

// Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function ReviewManagement() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState(null);
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
            const token = localStorage.getItem('token');
            
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
            setProducts(data.data || []);
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
            const token = localStorage.getItem('token');
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
            const token = localStorage.getItem('token');
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
        <div className="space-y-6">
            <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Review Management</h2>
                    <p className="text-sm text-gray-500">Manage product reviews and ratings.</p>
                </div>
            </div>

            {error && (
                <div className="admin-alert admin-alert-error">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Products List */}
                <div className="lg:col-span-1">
                    <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="admin-spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#2563eb' }}></div>
                            </div>
                        ) : products.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No products found</p>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {products.map((product) => (
                                    <button
                                        key={product._id}
                                        onClick={() => handleProductSelect(product)}
                                        className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                                            selectedProduct?._id === product._id
                                                ? 'bg-gray-800 text-white shadow-md'
                                                : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                                        }`}
                                        style={{
                                            borderRadius: '0.5rem'
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className={`font-semibold mb-1 ${
                                                    selectedProduct?._id === product._id ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {product.name}
                                                </div>
                                                <div className={`text-sm ${
                                                    selectedProduct?._id === product._id ? 'text-gray-300' : 'text-gray-600'
                                                }`}>
                                                    {product.rating ? (
                                                        <div className="flex items-center gap-1">
                                                            {renderStars(product.rating)}
                                                            <span className="ml-1">({product.numReviews || 0} reviews)</span>
                                                        </div>
                                                    ) : (
                                                        <span>No reviews yet</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`ml-3 flex-shrink-0 ${
                                                selectedProduct?._id === product._id ? 'text-yellow-400' : 'text-gray-400'
                                            }`}>
                                                <span className="text-xl">⭐</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2">
                    {selectedProduct ? (
                        <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h3>
                                    {ratingStats && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {ratingStats.averageRating?.toFixed(1) || '0.0'}
                                                </span>
                                                <div className="flex">{renderStars(ratingStats.averageRating || 0)}</div>
                                                <span className="text-sm text-gray-600">
                                                    ({ratingStats.totalReviews || 0} reviews)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="admin-btn admin-btn-secondary text-sm"
                                >
                                    Back to Products
                                </button>
                            </div>

                            {reviewsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="admin-spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#2563eb' }}></div>
                                </div>
                            ) : reviews.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No reviews found for this product</p>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="font-semibold text-gray-900">
                                                                {review.user?.username || 'Anonymous'}
                                                            </div>
                                                            <div className="flex">{renderStars(review.rating)}</div>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(review.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-gray-700 mt-2">{review.comment}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="admin-btn admin-btn-danger text-sm ml-4"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {pagination.pages > 1 && (
                                        <div className="mt-6">
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
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">Select a product to view its reviews</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}