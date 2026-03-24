'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, useAnalyticsFetch } from '../../../utils/reusable';
import '../../../assets/css/Analytics.css';

// Product Performance Component
function ProductPerformance() {
    const [days, setDays] = useState(30);
  
    const { data: performance, loading, error } = useAnalyticsFetch(
      '/dashboard/analytics/performance',
      { days },
      [days],
      'Failed to fetch product performance'
    );
  
    return (
      <div className="performance-container">
        {/* Filter */}
        <div className="performance-filter">
          <div className="performance-filter-row">
            <label className="performance-filter-label">Period:</label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="performance-filter-select"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>
  
        {loading ? (
          <div className="analytics-loading">
            <div className="analytics-loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="analytics-error">{error}</div>
        ) : performance ? (
          <div className="performance-grid">
            {/* Top Selling Products */}
            <div className="performance-card">
              <div className="performance-card-content">
                <h3 className="performance-card-title">
                  Top Selling Products
                </h3>
                <div className="performance-list">
                  {performance.topSellingProducts.map((product, index) => (
                    <div key={index} className="performance-item">
                      <div className="performance-item-left">
                        <h4 className="performance-item-title">{product.name}</h4>
                        <p className="performance-item-subtitle">{product.category}</p>
                      </div>
                      <div className="performance-item-right">
                        <div className="performance-item-value">
                          {product.totalSold} sold
                        </div>
                        <div className="performance-item-value-small">
                          {formatCurrency(product.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            {/* Category Performance */}
            <div className="performance-card">
              <div className="performance-card-content">
                <h3 className="performance-card-title">
                  Category Performance
                </h3>
                <div className="performance-list">
                  {performance.categoryPerformance.map((category, index) => (
                    <div key={index} className="performance-item">
                      <div className="performance-item-left">
                        <h4 className="performance-item-title-capitalize">{category.category}</h4>
                        <p className="performance-item-subtitle">{category.productCount} products</p>
                      </div>
                      <div className="performance-item-right">
                        <div className="performance-item-value">
                          {category.totalSold} sold
                        </div>
                        <div className="performance-item-value-small">
                          {formatCurrency(category.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            {/* Summary Stats */}
            <div className="performance-summary-card">
              <div className="performance-card-content">
                <h3 className="performance-card-title">
                  Performance Summary
                </h3>
                <div className="performance-summary-grid">
                  <div className="performance-stat-card performance-stat-card-blue">
                    <div className="performance-stat-value performance-stat-value-blue">{performance.totalActiveProducts}</div>
                    <div className="performance-stat-label performance-stat-label-blue">Active Products</div>
                  </div>
                  <div className="performance-stat-card performance-stat-card-yellow">
                    <div className="performance-stat-value performance-stat-value-yellow">{performance.lowStockCount}</div>
                    <div className="performance-stat-label performance-stat-label-yellow">Low Stock Items</div>
                  </div>
                  <div className="performance-stat-card performance-stat-card-green">
                    <div className="performance-stat-value performance-stat-value-green">{performance.categoryPerformance.length}</div>
                    <div className="performance-stat-label performance-stat-label-green">Active Categories</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
  
export default ProductPerformance;
