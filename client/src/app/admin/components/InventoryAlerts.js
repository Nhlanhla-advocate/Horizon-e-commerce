'use client'

import { useState, useEffect } from 'react';
import '../../assets/css/inventoryAlerts.css';

export default function InventoryAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        threshold: 10,
        days: 30,
        category: ''
    });

    useEffect(() => {
        fetchLowStockAlerts();
    }, [filters]);

    const fetchLowStockAlerts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`/dashboard/analytics/low-stock-alerts?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch low stock alerts');
            }

            const data = await response.json();
            setAlerts(data.data);
            setSummary(data.summary);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ZAR'
            }).format(amount);
        };

        const getAlertIcon = (alertLevel) => {
            switch (alertLevel) {
                case 'critical':
                    return '';
                case 'warning':
                    return '';
                case 'low':
                    return '';
                default:
                    return '';
            }
        };

        const getAlertColor = (alertLevel) => {
            switch (alertLevel) {
                case 'critical':
                    return 'inventory-alerts-badge-critical';
                case 'warning':
                    return 'inventory-alerts-badge-warning';
                case 'low':
                    return 'inventory-alerts-badge-low';
                default:
                    return 'inventory-alerts-badge-default';
            }
        };

        return (
            <div className="inventory-alerts-container">
                 {/* Header */}
      <div className="inventory-alerts-header">
        <div>
          <h2 className="inventory-alerts-title">Inventory Alerts</h2>
          <p className="inventory-alerts-subtitle">Monitor stock levels and manage inventory alerts</p>
        </div>
        <button
          onClick={fetchLowStockAlerts}
          disabled={loading}
          className="inventory-alerts-refresh-btn"
        >
          {loading ? (
            <div className="inventory-alerts-refresh-spinner"></div>
          ) : (
            <span className="inventory-alerts-refresh-icon"></span>
          )}
          <span>Refresh Alerts</span>
        </button>
      </div>


      {/* Summary Cards */}
      {summary && (
        <div className="inventory-alerts-summary-grid">
          <div className="inventory-alerts-summary-card">
            <div className="inventory-alerts-summary-card-content">
              <div className="inventory-alerts-summary-card-inner">
                <div className="inventory-alerts-summary-icon-container">
                  <div className="inventory-alerts-summary-icon inventory-alerts-summary-icon-gray">
                  </div>
                </div>
                <div className="inventory-alerts-summary-text-container">
                  <dl>
                    <dt className="inventory-alerts-summary-label">Total Alerts</dt>
                    <dd className="inventory-alerts-summary-value">{summary.total}</dd>
                  </dl>
                </div>
                <div className="inventory-alerts-summary-indicator">
                  <div className="inventory-alerts-summary-dot inventory-alerts-summary-dot-gray"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="inventory-alerts-summary-card">
            <div className="inventory-alerts-summary-card-content">
              <div className="inventory-alerts-summary-card-inner">
                <div className="inventory-alerts-summary-icon-container">
                  <div className="inventory-alerts-summary-icon inventory-alerts-summary-icon-red">
                  </div>
                </div>
                <div className="inventory-alerts-summary-text-container">
                  <dl>
                    <dt className="inventory-alerts-summary-label">Critical</dt>
                    <dd className="inventory-alerts-summary-value">{summary.critical}</dd>
                  </dl>
                </div>
                <div className="inventory-alerts-summary-indicator">
                  <div className="inventory-alerts-summary-dot inventory-alerts-summary-dot-red"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="inventory-alerts-summary-card">
            <div className="inventory-alerts-summary-card-content">
              <div className="inventory-alerts-summary-card-inner">
                <div className="inventory-alerts-summary-icon-container">
                  <div className="inventory-alerts-summary-icon inventory-alerts-summary-icon-yellow">
                  </div>
                </div>
                <div className="inventory-alerts-summary-text-container">
                  <dl>
                    <dt className="inventory-alerts-summary-label">Warning</dt>
                    <dd className="inventory-alerts-summary-value">{summary.warning}</dd>
                  </dl>
                </div>
                <div className="inventory-alerts-summary-indicator">
                  <div className="inventory-alerts-summary-dot inventory-alerts-summary-dot-yellow"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="inventory-alerts-summary-card">
            <div className="inventory-alerts-summary-card-content">
              <div className="inventory-alerts-summary-card-inner">
                <div className="inventory-alerts-summary-icon-container">
                  <div className="inventory-alerts-summary-icon inventory-alerts-summary-icon-blue">
                  </div>
                </div>
                <div className="inventory-alerts-summary-text-container">
                  <dl>
                    <dt className="inventory-alerts-summary-label">Low</dt>
                    <dd className="inventory-alerts-summary-value">{summary.low}</dd>
                  </dl>
                </div>
                <div className="inventory-alerts-summary-indicator">
                  <div className="inventory-alerts-summary-dot inventory-alerts-summary-dot-blue"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="inventory-alerts-summary-card">
            <div className="inventory-alerts-summary-card-content">
              <div className="inventory-alerts-summary-card-inner">
                <div className="inventory-alerts-summary-icon-container">
                  <div className="inventory-alerts-summary-icon inventory-alerts-summary-icon-red-dark">
                  </div>
                </div>
                <div className="inventory-alerts-summary-text-container">
                  <dl>
                    <dt className="inventory-alerts-summary-label">Out of Stock</dt>
                    <dd className="inventory-alerts-summary-value">{summary.outOfStock}</dd>
                  </dl>
                </div>
                <div className="inventory-alerts-summary-indicator">
                  <div className="inventory-alerts-summary-dot inventory-alerts-summary-dot-red-dark"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Filters */}
      <div className="inventory-alerts-filters">
        <div className="inventory-alerts-filters-grid">
          <div>
            <label className="inventory-alerts-filter-label">Stock Threshold</label>
            <input
              type="number"
              value={filters.threshold}
              onChange={(e) => setFilters({...filters, threshold: e.target.value})}
              placeholder="Stock threshold"
              className="inventory-alerts-filter-input"
            />
          </div>
          <div>
            <label className="inventory-alerts-filter-label">Analysis Period (days)</label>
            <select
              value={filters.days}
              onChange={(e) => setFilters({...filters, days: e.target.value})}
              className="inventory-alerts-filter-input"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div>
            <label className="inventory-alerts-filter-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="inventory-alerts-filter-input"
            >
              <option value="">All Categories</option>
              <option value="jewelry">Jewelry</option>
              <option value="electronics">Electronics</option>
              <option value="consoles">Consoles</option>
              <option value="computers">Computers</option>
            </select>
          </div>
          <div className="inventory-alerts-filter-reset-container">
            <button
              onClick={() => setFilters({ threshold: 10, days: 30, category: '' })}
              className="inventory-alerts-filter-reset-btn"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>


      {/* Error Display */}
      {error && (
        <div className="inventory-alerts-error">
          <p className="inventory-alerts-error-text">{error}</p>
        </div>
      )}


      {/* Alerts Table */}
      <div className="inventory-alerts-table-container">
        <div className="inventory-alerts-table-inner">
          <h3 className="inventory-alerts-table-title">
            Low Stock Alerts
          </h3>
         
          {loading ? (
            <div className="inventory-alerts-loading">
              <div className="inventory-alerts-loading-spinner"></div>
            </div>
          ) : (
            <div className="inventory-alerts-table-wrapper">
              <table className="inventory-alerts-table">
                <thead>
                  <tr>
                    <th>Alert Level</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Reorder Level</th>
                    <th>Avg Daily Sales</th>
                    <th>Days Until Out</th>
                    <th>Total Sold</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert._id}>
                      <td>
                        <div className={`inventory-alerts-badge ${getAlertColor(alert.alertLevel)}`}>
                          <span className="inventory-alerts-badge-icon">{getAlertIcon(alert.alertLevel)}</span>
                          {alert.alertLevel}
                        </div>
                      </td>
                      <td>
                        <div className="inventory-alerts-table-product-name">{alert.name}</div>
                      </td>
                      <td>
                        <span className="inventory-alerts-table-category-badge">
                          {alert.category}
                        </span>
                      </td>
                      <td>
                        <span className={`inventory-alerts-table-stock ${
                          alert.stock === 0 ? 'inventory-alerts-table-stock-red-600' :
                          alert.stock <= 5 ? 'inventory-alerts-table-stock-red-500' :
                          alert.stock <= 10 ? 'inventory-alerts-table-stock-yellow-600' : 'inventory-alerts-table-stock-green-600'
                        }`}>
                          {alert.stock}
                        </span>
                      </td>
                      <td>{alert.reorderLevel}</td>
                      <td>{alert.averageDailySales}</td>
                      <td>
                        {alert.estimatedDaysUntilOutOfStock !== null ? (
                          <span className={`inventory-alerts-table-days ${
                            alert.estimatedDaysUntilOutOfStock <= 7 ? 'inventory-alerts-table-days-red' :
                            alert.estimatedDaysUntilOutOfStock <= 14 ? 'inventory-alerts-table-days-yellow' : 'inventory-alerts-table-days-green'
                          }`}>
                            {alert.estimatedDaysUntilOutOfStock} days
                          </span>
                        ) : (
                          <span className="inventory-alerts-table-na">N/A</span>
                        )}
                      </td>
                      <td>{alert.totalSold}</td>
                      <td>{formatCurrency(alert.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {alerts.length === 0 && (
                <div className="inventory-alerts-empty">
                  <p className="inventory-alerts-empty-text">No low stock alerts found!</p>
                  <p className="inventory-alerts-empty-subtext">All products are well stocked.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Action Buttons */}
      {alerts.length > 0 && (
        <div className="inventory-alerts-actions">
          <div className="inventory-alerts-actions-inner">
            <div>
              <h4 className="inventory-alerts-actions-title">Quick Actions</h4>
              <p className="inventory-alerts-actions-subtitle">Manage your inventory alerts</p>
            </div>
            <div className="inventory-alerts-actions-buttons">
              <button className="inventory-alerts-action-btn inventory-alerts-action-btn-blue">
                Export Alerts
              </button>
              <button className="inventory-alerts-action-btn inventory-alerts-action-btn-green">
                Generate Purchase Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}