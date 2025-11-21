'use client';

import { useState, useEffect } from 'react';
import '../../assets/css/admin.css';

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
          <div className="flex items-center justify-center" style={{ height: '16rem' }}>
            <div className="flex items-center space-x-4">
              <div className="admin-spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#2563eb' }}></div>
              <span className="text-gray-600">Loading dashboard...</span>
            </div>
          </div>
        );
      }
    
    
      if (error) {
        return (
          <div className="admin-alert admin-alert-error">
            <p className="text-sm">{error}</p>
            <button
              onClick={refreshStats}
              className="admin-btn admin-btn-danger mt-4"
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
              className="admin-btn admin-btn-secondary flex items-center space-x-2"
            >
              {loading ? (
                <div className="admin-spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#4b5563' }}></div>
              ) : (
                <span className="text-lg">↻</span>
              )}
              <span>Refresh Data</span>
            </button>
          </div>
    
    
          {/* Stats Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="stat-card-label">Total Products</p>
                  <p className="stat-card-value">{stats?.overview?.totalProducts || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                  <span className="text-lg">📦</span>
                </div>
              </div>
            </div>
    
    
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="stat-card-label">Active Products</p>
                  <p className="stat-card-value">{stats?.overview?.activeProducts || 0}</p>
                  <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#dcfce7', color: '#059669' }}>
                  <span className="text-lg">✓</span>
                </div>
              </div>
            </div>
    
    
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="stat-card-label">Total Users</p>
                  <p className="stat-card-value">{stats?.overview?.totalUsers || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">+15.3% from last month</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                  <span className="text-lg">👥</span>
                </div>
              </div>
            </div>
    
    
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="stat-card-label">Total Orders</p>
                  <p className="stat-card-value">{stats?.overview?.totalOrders || 0}</p>
                  <p className="text-xs text-yellow-600 mt-1">+22.1% from last month</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <span className="text-lg">📋</span>
                </div>
              </div>
            </div>
    
    
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="stat-card-label">Total Revenue</p>
                  <p className="stat-card-value">{formatCurrency(stats?.overview?.totalRevenue || 0)}</p>
                  <p className="text-xs text-green-600 mt-1">+18.7% from last month</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                  <span className="text-lg">💰</span>
                </div>
              </div>
            </div>
    
    
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="stat-card-label">Low Stock</p>
                  <p className="stat-card-value">{stats?.overview?.lowStockProducts || 0}</p>
                  <p className={`text-xs mt-1 ${(stats?.overview?.lowStockProducts || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {(stats?.overview?.lowStockProducts || 0) > 0 ? 'Needs attention' : 'All good'}
                  </p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <span className="text-lg">⚠</span>
                </div>
              </div>
            </div>
          </div>
    
    
          {/* Recent Orders and Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="admin-card" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(to right, #3b82f6, #9333ea)', padding: '1rem 1.5rem' }}>
                <div className="flex items-center space-x-4">
                  <div style={{ width: '2rem', height: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats?.recentOrders?.length > 0 ? (
                    stats.recentOrders.map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100" style={{ transition: 'background-color 0.2s' }}>
                        <div className="flex items-center space-x-4">
                          <div style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(to right, #3b82f6, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
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
                          <span className={`admin-badge ${
                            order.status === 'completed' ? 'admin-badge-success' :
                            order.status === 'pending' ? 'admin-badge-warning' :
                            'admin-badge-danger'
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
            <div className="admin-card" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(to right, #eab308, #f97316)', padding: '1rem 1.5rem' }}>
                <div className="flex items-center space-x-4">
                  <div style={{ width: '2rem', height: '2rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Top Rated Products</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats?.topRatedProducts?.length > 0 ? (
                    stats.topRatedProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100" style={{ transition: 'background-color 0.2s' }}>
                        <div className="flex items-center space-x-4">
                          <div style={{ width: '2.5rem', height: '2.5rem', background: 'linear-gradient(to right, #facc15, #f97316)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      color: i < Math.round(product.rating || 0) ? '#facc15' : '#d1d5db',
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    ★
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
    