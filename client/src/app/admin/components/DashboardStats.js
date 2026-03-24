'use client';

import { useState, useEffect, useMemo } from 'react';
import '../../assets/css/admin.css';
import '../../assets/css/dashboardstats.css';
import DashboardCharts from './DashboardCharts';
import SearchBar from './SearchBar';

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

            // Use adminToken for admin dashboard, fallback to token for backward compatibility
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
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
          <div className="dashboard-loading-container">
            <div className="dashboard-loading-content">
              <div className="admin-spinner" style={{ width: '2rem', height: '2rem', borderTopColor: '#2563eb' }}></div>
              <span className="dashboard-loading-text">Loading dashboard...</span>
            </div>
          </div>
        );
    }
    
    if (error) {
        return (
          <div className="admin-alert admin-alert-error">
            <p className="dashboard-error-text">{error}</p>
            <button
              onClick={refreshStats}
              className="admin-btn admin-btn-danger dashboard-error-retry"
            >
              Retry
            </button>
          </div>
        );
    }
    
    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title">Dashboard Overview</h2>
              {lastUpdated && (
                <p className="dashboard-last-updated">
                  Last updated: {formatDate(lastUpdated)}
                </p>
              )}
            </div>
            <button
              onClick={refreshStats}
              disabled={loading}
              className="admin-btn admin-btn-secondary dashboard-refresh-btn"
            >
              {loading ? (
                <div className="admin-spinner" style={{ width: '0.75rem', height: '0.75rem', borderTopColor: '#4b5563' }}></div>
              ) : (
                <span className="dashboard-refresh-icon">↻</span>
              )}
              <span className="dashboard-refresh-text">Refresh</span>
            </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginTop: '1rem', marginBottom: '1.5rem', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ maxWidth: '32rem', width: '100%' }}>
                <SearchBar />
              </div>
            </div>
    
            {/* Stats Cards Row - Top */}
            <div className="stats-grid dashboard-stats-grid" style={{ gap: '0.75rem' }}>
            <div className="stat-card">
              <div className="dashboard-stat-card-content">
                <div className="dashboard-stat-card-content-left">
                  <p className="stat-card-label">Total Products</p>
                  <p className="stat-card-value">{stats?.overview?.totalProducts || 0}</p>
                  <p className="dashboard-stat-percentage-small-green">+12.5%</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                  <span className="dashboard-stat-icon">📦</span>
                </div>
              </div>
            </div>
    
            <div className="stat-card">
              <div className="dashboard-stat-card-content">
                <div className="dashboard-stat-card-content-left">
                  <p className="stat-card-label">Active Products</p>
                  <p className="stat-card-value">{stats?.overview?.activeProducts || 0}</p>
                  <p className="dashboard-stat-percentage-medium">+8.2% from last month</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#dcfce7', color: '#059669' }}>
                  <span className="dashboard-stat-icon">✓</span>
                </div>
              </div>
            </div>
    
            <div className="stat-card">
              <div className="dashboard-stat-card-content">
                <div className="dashboard-stat-card-content-left">
                  <p className="stat-card-label">Total Users</p>
                  <p className="stat-card-value">{stats?.overview?.totalUsers || 0}</p>
                  <p className="dashboard-stat-percentage-small-blue">+15.3%</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                  <span className="dashboard-stat-icon">👥</span>
                </div>
              </div>
            </div>
    
            <div className="stat-card">
              <div className="dashboard-stat-card-content">
                <div className="dashboard-stat-card-content-left">
                  <p className="stat-card-label">Total Orders</p>
                  <p className="stat-card-value">{stats?.overview?.totalOrders || 0}</p>
                  <p className="dashboard-stat-percentage-small-yellow">+22.1%</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                  <span className="dashboard-stat-icon">📋</span>
                </div>
              </div>
            </div>
    
            <div className="stat-card">
              <div className="dashboard-stat-card-content">
                <div className="dashboard-stat-card-content-left">
                  <p className="stat-card-label">Total Revenue</p>
                  <p className="stat-card-value">{formatCurrency(stats?.overview?.totalRevenue || 0)}</p>
                  <p className="dashboard-stat-percentage-medium">+18.7% from last month</p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                  <span className="dashboard-stat-icon">💰</span>
                </div>
              </div>
            </div>
    
            <div className="stat-card">
              <div className="dashboard-stat-card-content">
                <div className="dashboard-stat-card-content-left">
                  <p className="stat-card-label">Low Stock</p>
                  <p className="stat-card-value">{stats?.overview?.lowStockProducts || 0}</p>
                  <p className={`dashboard-stat-percentage-small ${(stats?.overview?.lowStockProducts || 0) > 0 ? 'dashboard-stat-percentage-small-red' : 'dashboard-stat-percentage-small-green'}`}>
                    {(stats?.overview?.lowStockProducts || 0) > 0 ? 'Alert' : 'OK'}
                  </p>
                </div>
                <div className="stat-card-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <span className="dashboard-stat-icon">⚠</span>
                </div>
              </div>
            </div>
            </div>
    
            {/* Charts Section - 4 Box (2x2) Grid Layout */}
            <div className="charts-4box-grid dashboard-charts-section">
                {/* Top Left - Revenue Over Time */}
                <DashboardCharts showCharts={['revenue']} />
                
                {/* Top Right - Orders Over Time */}
                <DashboardCharts showCharts={['orders']} />
                
                {/* Bottom Left - Order Status Distribution */}
                <DashboardCharts showCharts={['status']} />
                
                {/* Bottom Right - Products by Category */}
                <DashboardCharts showCharts={['category']} />
            </div>

            {/* Third Section - Recent Orders and Top Rated Products in 2-Grid Layout */}
            <div className="dashboard-grid-section">
                {/* Recent Orders */}
                <div className="admin-card" style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: 'linear-gradient(to right, #3b82f6, #9333ea)', padding: '0.375rem 0.5rem' }}>
                        <h3 className="dashboard-card-header">Recent Orders</h3>
                    </div>
                    <div className="dashboard-card-content">
                        <div className="dashboard-card-list">
                            {stats?.recentOrders?.length > 0 ? (
                                stats.recentOrders.slice(0, 5).map((order, index) => (
                                    <div key={order._id || `order-${index}`} className="dashboard-item">
                                        <div className="dashboard-item-left">
                                            <div style={{ width: '1.5rem', height: '1.5rem', background: 'linear-gradient(to right, #3b82f6, #9333ea)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.625rem', flexShrink: 0 }}>
                                                {order.customerId?.username?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="dashboard-item-content">
                                                <p className="dashboard-item-title">
                                                    {order.customerId?.username || 'Unknown User'}
                                                </p>
                                                <p className="dashboard-item-subtitle">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="dashboard-item-right">
                                            <p className="dashboard-item-price">
                                                {formatCurrency(order.totalPrice)}
                                            </p>
                                            <span className={`admin-badge dashboard-item-badge ${
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
                                <div className="dashboard-empty-state">
                                    <p className="dashboard-empty-text">No recent orders</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Rated Products */}
                <div className="admin-card" style={{ borderRadius: '0.75rem', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: 'linear-gradient(to right, #eab308, #f97316)', padding: '0.375rem 0.5rem' }}>
                        <h3 className="dashboard-card-header">Top Rated Products</h3>
                    </div>
                    <div className="dashboard-card-content">
                        <div className="dashboard-card-list">
                            {stats?.topRatedProducts?.length > 0 ? (
                                stats.topRatedProducts.slice(0, 5).map((product, index) => (
                                    <div key={product._id || index} className="dashboard-item">
                                        <div className="dashboard-item-left">
                                            <div style={{ width: '1.5rem', height: '1.5rem', background: 'linear-gradient(to right, #facc15, #f97316)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.625rem', flexShrink: 0 }}>
                                                {index + 1}
                                            </div>
                                            <div className="dashboard-item-content">
                                                <p className="dashboard-item-title">{product.name}</p>
                                                <div className="dashboard-item-rating-container">
                                                    <div className="dashboard-item-rating-stars">
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <span
                                                                key={i}
                                                                style={{
                                                                    color: i < Math.round(product.rating || 0) ? '#facc15' : '#d1d5db',
                                                                    fontSize: '0.5rem'
                                                                }}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="dashboard-item-rating-value">
                                                        {product.rating?.toFixed(1) || '0.0'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dashboard-item-right">
                                            <p className="dashboard-item-price">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="dashboard-empty-state">
                                    <p className="dashboard-empty-text">No top rated products</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}