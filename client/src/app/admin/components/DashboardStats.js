'use client';

import { useState, useEffect } from 'react';

// Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function DashboardStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please log in.');
            }

            const response = await fetch(`${BASE_URL}/dashboard/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorData = {};
                try {
                    const text = await response.text();
                    errorData = text ? JSON.parse(text) : {};
                } catch (parseError) {
                    console.error('Failed to parse error response:', parseError);
                }
                
                if (response.status === 401) {
                    throw new Error(errorData.message || 'Authentication failed. Please log in again.');
                } else if (response.status === 403) {
                    throw new Error(errorData.message || 'Access denied. Admin privileges required.');
                } else if (response.status === 500) {
                    throw new Error(errorData.error || errorData.message || 'Server error. Please try again later.');
                }
                throw new Error(errorData.error || errorData.message || `Failed to fetch dashboard stats (${response.status})`);
            }

            const responseData = await response.json();
            
            if (!responseData.success) {
                throw new Error(responseData.error || 'Failed to fetch dashboard stats');
            }
            
            if (!responseData.data) {
                throw new Error('Invalid response format: missing data');
            }
            
            setStats(responseData.data);
            setLastUpdated(responseData.lastUpdated || new Date().toISOString());
        } catch (err) {
            const errorMessage = err.message || 'An unexpected error occurred';
            setError(errorMessage);
            console.error('Error fetching dashboard stats:', {
                message: errorMessage,
                error: err,
                stack: err.stack
            });
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = () => {
        fetchStats();
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ZAR',
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        );
      }
    
    
      if (error) {
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={refreshStats}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Retry
            </button>
          </div>
        );
      }
    
    
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {formatDate(lastUpdated)}
                </p>
              )}
            </div>
            <button
              onClick={refreshStats}
              disabled={loading}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <span className="text-lg">↻</span>
              )}
              <span>Refresh Data</span>
            </button>
          </div>
    
    
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.totalProducts || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📦</span>
                </div>
              </div>
            </div>
    
    
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Active Products</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.activeProducts || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
              </div>
            </div>
    
    
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.totalUsers || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">+15.3% from last month</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
              </div>
            </div>
    
    
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.totalOrders || 0}</p>
                  <p className="text-xs text-yellow-600 mt-1">+22.1% from last month</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-lg">📋</span>
                </div>
              </div>
            </div>
    
    
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats?.overview?.totalRevenue || 0)}</p>
                  <p className="text-xs text-green-600 mt-1">+18.7% from last month</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 text-lg">💰</span>
                </div>
              </div>
            </div>
    
    
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats?.overview?.lowStockProducts || 0}</p>
                  <p className={`text-xs mt-1 ${(stats?.overview?.lowStockProducts || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {(stats?.overview?.lowStockProducts || 0) > 0 ? 'Needs attention' : 'All good'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠</span>
                </div>
              </div>
            </div>
          </div>
    
    
          {/* Recent Orders and Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  </div>
                  <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats?.recentOrders?.length > 0 ? (
                    stats.recentOrders.map((order, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {order.customerId?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {order.customerId?.username || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(order.totalPrice)}
                          </p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No recent orders</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
    
    
            {/* Top Rated Products */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  </div>
                  <h3 className="text-lg font-semibold text-white">Top Rated Products</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats?.topRatedProducts?.length > 0 ? (
                    stats.topRatedProducts.map((product, index) => (
                      <div key={index} className="group flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span
                                    key={i}
                                    className={`text-xs ${
                                      i < Math.round(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No top rated products</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    