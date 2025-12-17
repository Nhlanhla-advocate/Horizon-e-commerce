'use client';

import { useState, useEffect } from 'react';
import '../../assets/css/cacheManagement.css';


export default function CacheManagement() {
  const [cacheStatus, setCacheStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);


  useEffect(() => {
    fetchCacheStatus();
  }, []);


  const fetchCacheStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/dashboard/cache/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {
        throw new Error('Failed to fetch cache status');
      }


      const data = await response.json();
      setCacheStatus(data.cacheStatus);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const refreshCache = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/dashboard/cache/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {
        throw new Error('Failed to refresh cache');
      }


      // Refresh cache status after successful refresh
      await fetchCacheStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };


  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear the dashboard cache? This will force fresh data calculation on the next request.')) {
      return;
    }


    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('/api/dashboard/cache/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });


      if (!response.ok) {
        throw new Error('Failed to clear cache');
      }


      // Refresh cache status after successful clear
      await fetchCacheStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };


  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${seconds} seconds`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };


  const getCacheStatusColor = (isExpired) => {
    return isExpired ? 'cache-management-status-value-expired' : 'cache-management-status-value-valid';
  };


  const getCacheStatusIcon = (isExpired) => {
    return isExpired ? '❌' : '✅';
  };


  return (
    <div className="cache-management-container">
      {/* Header */}
      <div className="cache-management-header">
        <div>
          <h2 className="cache-management-title">Cache Management</h2>
          <p className="cache-management-subtitle">Manage dashboard cache performance and data freshness</p>
        </div>
        <button
          onClick={fetchCacheStatus}
          disabled={loading}
          className="cache-management-refresh-btn"
        >
          {loading ? (
            <div className="cache-management-refresh-spinner"></div>
          ) : (
            <span className="cache-management-refresh-icon"></span>
          )}
          <span>Refresh Status</span>
        </button>
      </div>


      {/* Error Display */}
      {error && (
        <div className="cache-management-error">
          <div className="cache-management-error-content">
            <div className="cache-management-error-text">
              <h3 className="cache-management-error-title">Error</h3>
              <div className="cache-management-error-message">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Cache Status Overview */}
      <div className="cache-management-overview-grid">
        <div className="cache-management-status-card">
          <div className="cache-management-status-card-content">
            <div className="cache-management-status-card-inner">
              <div className="cache-management-status-icon-container">
                <div className="cache-management-status-icon cache-management-status-icon-blue">
                </div>
              </div>
              <div className="cache-management-status-text-container">
                <dl>
                  <dt className="cache-management-status-label">Cache Status</dt>
                  <dd className={`cache-management-status-value ${getCacheStatusColor(cacheStatus?.isExpired)}`}>
                    {cacheStatus ? (
                      <>
                        <span className="cache-management-status-icon-inline">{getCacheStatusIcon(cacheStatus.isExpired)}</span>
                        {cacheStatus.isExpired ? 'Expired' : 'Valid'}
                      </>
                    ) : (
                      'Unknown'
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="cache-management-status-card">
          <div className="cache-management-status-card-content">
            <div className="cache-management-status-card-inner">
              <div className="cache-management-status-icon-container">
                <div className="cache-management-status-icon cache-management-status-icon-green">
                </div>
              </div>
              <div className="cache-management-status-text-container">
                <dl>
                  <dt className="cache-management-status-label">Cache Age</dt>
                  <dd className="cache-management-status-value">
                    {cacheStatus ? formatDuration(cacheStatus.cacheAgeSeconds) : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="cache-management-status-card">
          <div className="cache-management-status-card-content">
            <div className="cache-management-status-card-inner">
              <div className="cache-management-status-icon-container">
                <div className="cache-management-status-icon cache-management-status-icon-yellow">
                </div>
              </div>
              <div className="cache-management-status-text-container">
                <dl>
                  <dt className="cache-management-status-label">Time Until Expiry</dt>
                  <dd className="cache-management-status-value">
                    {cacheStatus ? (
                      cacheStatus.timeUntilExpiry > 0 ?
                        formatDuration(cacheStatus.timeUntilExpiry) :
                        'Expired'
                    ) : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="cache-management-status-card">
          <div className="cache-management-status-card-content">
            <div className="cache-management-status-card-inner">
              <div className="cache-management-status-icon-container">
                <div className="cache-management-status-icon cache-management-status-icon-purple">
                </div>
              </div>
              <div className="cache-management-status-text-container">
                <dl>
                  <dt className="cache-management-status-label">Expiry Time</dt>
                  <dd className="cache-management-status-value">
                    {cacheStatus ? formatDuration(cacheStatus.cacheExpirySeconds) : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Detailed Cache Information */}
      {cacheStatus && (
        <div className="cache-management-details">
          <div className="cache-management-details-content">
            <h3 className="cache-management-details-title">
              Cache Details
            </h3>
            <div className="cache-management-details-grid">
              <div className="cache-management-details-column">
                <div>
                  <label className="cache-management-details-field">Last Updated</label>
                  <p className="cache-management-details-value">
                    {formatDate(cacheStatus.lastUpdated)}
                  </p>
                </div>
                <div>
                  <label className="cache-management-details-field">Cache Age</label>
                  <p className="cache-management-details-value">
                    {formatDuration(cacheStatus.cacheAgeSeconds)}
                  </p>
                </div>
                <div>
                  <label className="cache-management-details-field">Cache Expiry</label>
                  <p className="cache-management-details-value">
                    {formatDuration(cacheStatus.cacheExpirySeconds)}
                  </p>
                </div>
              </div>
              <div className="cache-management-details-column">
                <div>
                  <label className="cache-management-details-field">Status</label>
                  <p className={`cache-management-details-value-status ${getCacheStatusColor(cacheStatus.isExpired)}`}>
                    {getCacheStatusIcon(cacheStatus.isExpired)} {cacheStatus.isExpired ? 'Expired' : 'Valid'}
                  </p>
                </div>
                <div>
                  <label className="cache-management-details-field">Time Until Expiry</label>
                  <p className="cache-management-details-value">
                    {cacheStatus.timeUntilExpiry > 0 ?
                      formatDuration(cacheStatus.timeUntilExpiry) :
                      'Cache has expired'
                    }
                  </p>
                </div>
                <div>
                  <label className="cache-management-details-field">Performance Impact</label>
                  <p className="cache-management-details-value">
                    {cacheStatus.isExpired ?
                      'Next request will calculate fresh data (slower)' :
                      'Using cached data (faster)'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Cache Actions */}
      <div className="cache-management-actions">
        <div className="cache-management-actions-content">
          <h3 className="cache-management-actions-title">
            Cache Actions
          </h3>
          <div className="cache-management-actions-grid">
            <div className="cache-management-action-item">
              <div>
                <h4 className="cache-management-action-title">Refresh Cache</h4>
                <p className="cache-management-action-description">
                  Force refresh the dashboard cache with fresh data. This will recalculate all statistics.
                </p>
                <button
                  onClick={refreshCache}
                  disabled={actionLoading}
                  className="cache-management-action-btn cache-management-action-btn-blue"
                >
                  {actionLoading ? (
                    <div className="cache-management-action-spinner"></div>
                  ) : (
                    <span></span>
                  )}
                  <span>Refresh Cache</span>
                </button>
              </div>
            </div>
            <div className="cache-management-action-item">
              <div>
                <h4 className="cache-management-action-title">Clear Cache</h4>
                <p className="cache-management-action-description">
                  Remove all cached data. The next dashboard request will calculate fresh data.
                </p>
                <button
                  onClick={clearCache}
                  disabled={actionLoading}
                  className="cache-management-action-btn cache-management-action-btn-red"
                >
                  {actionLoading ? (
                    <div className="cache-management-action-spinner"></div>
                  ) : (
                    <span></span>
                  )}
                  <span>Clear Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Cache Information */}
      <div className="cache-management-info">
        <div className="cache-management-info-content">
          <div className="cache-management-info-icon">
          </div>
          <div className="cache-management-info-text">
            <h3 className="cache-management-info-title">About Dashboard Caching</h3>
            <div className="cache-management-info-list">
              <ul>
                <li>Dashboard statistics are cached to improve performance</li>
                <li>Cache automatically expires after a set time period</li>
                <li>Data-modifying operations (add/edit/delete products) automatically invalidate cache</li>
                <li>You can manually refresh or clear cache as needed</li>
                <li>Fresh data calculation may take a few seconds for large datasets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && !cacheStatus && (
        <div className="cache-management-loading">
          <div className="cache-management-loading-spinner"></div>
        </div>
      )}

      {/* No Cache State */}
      {!loading && !cacheStatus && !error && (
        <div className="cache-management-no-cache">
          <div className="cache-management-no-cache-content">
            <div className="cache-management-no-cache-icon"></div>
            <h3 className="cache-management-no-cache-title">No Cache Found</h3>
            <p className="cache-management-no-cache-text">No dashboard cache exists yet. Cache will be created on the first dashboard request.</p>
          </div>
        </div>
      )}
    </div>
  );
}
