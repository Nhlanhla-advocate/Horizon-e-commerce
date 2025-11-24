'use client';

import { useState, useEffect } from 'react';

export default function ReviewManagement() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
    });

    const [pagination, setPagination] = useState({});
    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchProductReviews();
        }
    }, [selectedProduct, filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch ('/dashboard/products?limit=100&status=active', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error ('Failed to fetch products'); 
            }

            const data = await response.json();
            setProducts(data.data);
            if (data.data.length > 0 && !selectedProduct) {
                setSelectedProduct(data.data[0]);
            }

            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductReviews = async () => {
        if (!selectedProduct) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch (`/dashboard/products/${selectedProduct._id}/review?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product reviews');
            }

            const data = await response.json();
            setReviews(data.data.reviews);
            setRatingStats(data.data.ratingStats);
            setPagination(data.data.pagination);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/dashboard/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete review');
            }

            // Refresh reviews after delation
            fetchProductReviews();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span 
                key={index}
                className={`text-lg ${
                    index < rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
            >
                ★
            </span>
        ));
    };

    const getRatingDistribution = () => {
        if (!ratingStats || !ratingStats.ratingDistribution) return [];

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratingStats.ratingDistribution.forEach(rating => {
            distribution[rating] = (distribution[rating] || 0) + 1;
        });

        return Object.entries(distribution).map(([rating, count]) => ({
            rating: parseInt(rating),
            count,
            percentage: ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0
        }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Review Management</h2>
                    <p className="text-gray-600 mt-1">Manage customer reviews and ratings</p>
                </div>
            </div>


    {/* Product Selection */}
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Select Product</h3>
    </div>
    <div className="flex items-center space-x-4">
      <label className="block text-sm font-medium text-gray-700">Choose a product to view reviews:</label>
      <select
        value={selectedProduct?._id || ''}
        onChange={(e) => {
          const product = products.find(p => p._id === e.target.value);
          setSelectedProduct(product);
        }}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
      >
        <option value="">Choose a product...</option>
        {products.map((product) => (
          <option key={product._id} value={product._id}>
            {product.name} ({product.numReviews || 0} reviews)
          </option>
        ))}
      </select>
    </div>
  </div>


  {selectedProduct && (
    <>
      {/* Product Info and Rating Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              </div>
              <h3 className="text-lg font-semibold text-white">Product Information</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedProduct.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{selectedProduct.category}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex">
                  {renderStars(Math.round(selectedProduct.rating || 0))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {selectedProduct.rating?.toFixed(1) || '0.0'} ({selectedProduct.numReviews || 0} reviews)
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Rating Statistics */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              </div>
              <h3 className="text-lg font-semibold text-white">Rating Statistics</h3>
            </div>
          </div>
          <div className="p-6">
            {ratingStats ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                    <div className="flex justify-center mb-2">
                      {renderStars(Math.round(ratingStats.averageRating || 0))}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {ratingStats.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {ratingStats.totalReviews || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Reviews</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Rating Distribution</h4>
                  {getRatingDistribution().map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700 w-8">{rating} ★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-16 text-right">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No rating statistics available</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={`${filters.sort}-${filters.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                setFilters({...filters, sort, order, page: 1});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Highest Rating</option>
              <option value="rating-asc">Lowest Rating</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviews per page</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: e.target.value, page: 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>


      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}


      {/* Reviews Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Product Reviews
          </h3>
         
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {review.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {review.title}
                        </h4>
                      )}
                      <p className="text-sm text-gray-700 mb-2">
                        {review.comment}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Rating: {review.rating}/5</span>
                        {review.user?.email && (
                          <span>Email: {review.user.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews found for this product</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} reviews
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters({...filters, page: filters.page - 1})}
              disabled={filters.page <= 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {filters.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setFilters({...filters, page: filters.page + 1})}
              disabled={filters.page >= pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  )}


  {!selectedProduct && !loading && (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Selected</h3>
        <p className="text-gray-500">Please select a product to view and manage its reviews.</p>
      </div>
    </div>
  )}
</div>
);
}
