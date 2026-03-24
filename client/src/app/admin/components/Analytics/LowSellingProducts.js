'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, useAnalyticsFetch } from '../../../utils/reusable';
import '../../../assets/css/Analytics.css';

// Low Selling Products Component
function LowSellingProducts() {
    const [filters, setFilters] = useState({
      limit: 10,
      days: 30,
      category: '',
      maxSales: 5
    });
  
    const { data: products = [], loading, error } = useAnalyticsFetch(
      '/dashboard/analytics/low-selling',
      filters,
      [filters.limit, filters.days, filters.category, filters.maxSales],
      'Failed to fetch low selling products'
    );
  
    return (
      <div className="analytics-container">
        {/* Filters */}
        <div className="analytics-filters">
          <div className="analytics-filters-grid">
            <div>
              <label className="analytics-filter-label">Period (days)</label>
              <select
                value={filters.days}
                onChange={(e) => setFilters({...filters, days: e.target.value})}
                className="analytics-filter-select"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div>
              <label className="analytics-filter-label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="analytics-filter-select"
              >
                <option value="">All Categories</option>
                <option value="jewelry">Jewelry</option>
                <option value="electronics">Electronics</option>
                <option value="consoles">Consoles</option>
                <option value="computers">Computers</option>
              </select>
            </div>
            <div>
              <label className="analytics-filter-label">Max Sales</label>
              <input
                type="number"
                value={filters.maxSales}
                onChange={(e) => setFilters({...filters, maxSales: e.target.value})}
                placeholder="Max sales"
                className="analytics-filter-input"
              />
            </div>
            <div>
              <label className="analytics-filter-label">Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({...filters, limit: e.target.value})}
                className="analytics-filter-select"
              >
                <option value="10">Top 10</option>
                <option value="20">Top 20</option>
                <option value="50">Top 50</option>
              </select>
            </div>
          </div>
        </div>
  
        {/* Results */}
        <div className="analytics-results">
          <div className="analytics-results-content">
            <h3 className="analytics-results-title">
              Low Selling Products
            </h3>
            
            {loading ? (
              <div className="analytics-loading">
                <div className="analytics-loading-spinner"></div>
              </div>
            ) : error ? (
              <div className="analytics-error">{error}</div>
            ) : (
              <div className="analytics-table-container">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Total Sold</th>
                      <th>Revenue</th>
                      <th>Created</th>
                      <th>Days Since Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <div className="analytics-table-cell-text">{product.name}</div>
                        </td>
                        <td>
                          <span className="analytics-category-badge">
                            {product.category}
                          </span>
                        </td>
                        <td className="analytics-table-cell-text">
                          {formatCurrency(product.price)}
                        </td>
                        <td>
                          <span className={
                            product.stock <= 10 ? 'analytics-stock-low' : 
                            product.stock <= 20 ? 'analytics-stock-medium' : 'analytics-stock-high'
                          }>
                            {product.stock}
                          </span>
                        </td>
                        <td className="analytics-table-cell-text">
                          {product.totalSold}
                        </td>
                        <td className="analytics-table-cell-text">
                          {formatCurrency(product.totalRevenue)}
                        </td>
                        <td className="analytics-table-cell-muted">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="analytics-table-cell-muted">
                          {product.daysSinceCreated} days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <p className="analytics-empty">No low selling products found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
export default LowSellingProducts;
  