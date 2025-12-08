'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, useAnalyticsFetch } from '../../../utils/reusable';
import '../../../assets/css/Analytics.css';

// Top Selling Products Component
function TopSellingProducts() {
    const [filters, setFilters] = useState({
      limit: 10,
      days: 30,
      category: '',
      minRevenue: '',
      minQuantity: ''
    });
  
    const { data: products = [], loading, error } = useAnalyticsFetch(
      '/dashboard/analytics/top-selling',
      filters,
      [filters.limit, filters.days, filters.category, filters.minRevenue, filters.minQuantity],
      'Failed to fetch top selling products'
    );
  
    return (
      <div className="topselling-container">
        {/* Filters */}
        <div className="topselling-filters">
          <div className="topselling-filters-header">
            <div className="topselling-filters-icon">
            </div>
            <h3 className="topselling-filters-title">Analytics Filters</h3>
          </div>
          <div className="topselling-filters-grid">
            <div>
              <label className="topselling-filter-label">Period</label>
              <select
                value={filters.days}
                onChange={(e) => setFilters({...filters, days: e.target.value})}
                className="topselling-filter-select"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div>
              <label className="topselling-filter-label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="topselling-filter-select"
              >
                <option value="">All Categories</option>
                <option value="jewelry">Jewelry</option>
                <option value="electronics">Electronics</option>
                <option value="consoles">Consoles</option>
                <option value="computers">Computers</option>
              </select>
            </div>
            <div>
              <label className="topselling-filter-label">Min Revenue</label>
              <input
                type="number"
                value={filters.minRevenue}
                onChange={(e) => setFilters({...filters, minRevenue: e.target.value})}
                placeholder="Min revenue"
                className="topselling-filter-input"
              />
            </div>
            <div>
              <label className="topselling-filter-label">Min Quantity</label>
              <input
                type="number"
                value={filters.minQuantity}
                onChange={(e) => setFilters({...filters, minQuantity: e.target.value})}
                placeholder="Min quantity"
                className="topselling-filter-input"
              />
            </div>
            <div>
              <label className="topselling-filter-label">Results</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({...filters, limit: e.target.value})}
                className="topselling-filter-select"
              >
                <option value="5">Top 5</option>
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
        </div>
  
        {/* Results */}
        <div className="topselling-results">
          <div className="topselling-results-header">
            <div className="topselling-results-header-content">
              <div className="topselling-results-icon">
              </div>
              <h3 className="topselling-results-title">Top Selling Products</h3>
            </div>
          </div>
          
          <div className="topselling-results-content">
            {loading ? (
              <div className="topselling-loading">
                <div className="topselling-loading-content">
                  <div className="topselling-loading-spinner"></div>
                  <span className="topselling-loading-text">Loading analytics...</span>
                </div>
              </div>
            ) : error ? (
              <div className="topselling-error">
                <p className="topselling-error-message">{error}</p>
              </div>
            ) : (
              <div className="topselling-product-list">
                {products.map((product, index) => (
                  <div key={product._id} className="topselling-product-item">
                    <div className="topselling-product-left">
                      <div className="topselling-product-rank">
                        <div className={`topselling-rank-badge ${
                          index === 0 ? 'topselling-rank-badge-gold' :
                          index === 1 ? 'topselling-rank-badge-silver' :
                          index === 2 ? 'topselling-rank-badge-bronze' :
                          'topselling-rank-badge-default'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="topselling-product-info">
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                      </div>
                    </div>
                    <div className="topselling-product-right">
                      <div className="topselling-product-stats">
                        <div>
                          <div className="topselling-stat-value topselling-stat-value-default">
                            {product.totalSold}
                          </div>
                          <div className="topselling-stat-label">
                            Units Sold
                          </div>
                        </div>
                        <div>
                          <div className="topselling-stat-value topselling-stat-value-green">
                            {formatCurrency(product.totalRevenue)}
                          </div>
                          <div className="topselling-stat-label">
                            Revenue
                          </div>
                        </div>
                        <div>
                          <div className="topselling-stat-value topselling-stat-value-blue">
                            {product.orderCount}
                          </div>
                          <div className="topselling-stat-label">
                            Orders
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="topselling-empty">
                    <h3 className="topselling-empty-title">No Data Available</h3>
                    <p className="topselling-empty-text">No products found for the selected criteria</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
export default TopSellingProducts;
  