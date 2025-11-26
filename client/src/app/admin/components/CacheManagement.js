'use client';

import { useState, useEffect} from 'react';

export default function CacheManagement() {
    const [cacheStatus, setCacheStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect (() => {
        fetchCacheStatus();
    }, []);

    const fetchCacheStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/dashboard/cache/status', {
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

    const refreshCache = async() => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/dashboard/cache/refresh', {
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
        if (!confirm('Are you sure you want to clear the cache? This will force fresh data calculation on the next request.')) {
            return;
        }

        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/dashboard/cache/clear', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to clear cache');
            }

            //Refresh cache status after successful clear
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
    return isExpired ? 'text-red-600' : 'text-green-600';
  };

  const getCacheStatusIcon = (isExpired) => {
    return isExpired ? 'Red' : 'Green';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cache Management</h2>
          <p className="text-gray-600 mt-1">Manage dashboard cache performance and data freshness</p>
        </div>
        <button
          onClick={fetchCacheStatus}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-300 disabled:to-purple-400 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 self-start sm:self-auto"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span className="text-lg"></span>
          )}
          <span>Refresh Status</span>
        </button>
      </div>


      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Cache Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cache Status</dt>
                  <dd className={`text-lg font-medium ${getCacheStatusColor(cacheStatus?.isExpired)}`}>
                    {cacheStatus ? (
                      <>
                        <span className="mr-1">{getCacheStatusIcon(cacheStatus.isExpired)}</span>
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


        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cache Age</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {cacheStatus ? formatDuration(cacheStatus.cacheAgeSeconds) : 'N/A'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>


        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Time Until Expiry</dt>
                  <dd className="text-lg font-medium text-gray-900">
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


        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expiry Time</dt>
                  <dd className="text-lg font-medium text-gray-900">
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Cache Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(cacheStatus.lastUpdated)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cache Age</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDuration(cacheStatus.cacheAgeSeconds)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cache Expiry</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDuration(cacheStatus.cacheExpirySeconds)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className={`mt-1 text-sm font-medium ${getCacheStatusColor(cacheStatus.isExpired)}`}>
                    {getCacheStatusIcon(cacheStatus.isExpired)} {cacheStatus.isExpired ? 'Expired' : 'Valid'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time Until Expiry</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {cacheStatus.timeUntilExpiry > 0 ?
                      formatDuration(cacheStatus.timeUntilExpiry) :
                      'Cache has expired'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Performance Impact</label>
                  <p className="mt-1 text-sm text-gray-900">
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Cache Actions
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Refresh Cache</h4>
                <p className="text-sm text-gray-600">
                  Force refresh the dashboard cache with fresh data. This will recalculate all statistics.
                </p>
                <button
                  onClick={refreshCache}
                  disabled={actionLoading}
                  className="mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <span></span>
                  )}
                  <span>Refresh Cache</span>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Clear Cache</h4>
                <p className="text-sm text-gray-600">
                  Remove all cached data. The next dashboard request will calculate fresh data.
                </p>
                <button
                  onClick={clearCache}
                  disabled={actionLoading}
                  className="mt-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Dashboard Caching</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
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
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}


      {/* No Cache State */}
      {!loading && !cacheStatus && !error && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="text-gray-400 text-4xl mb-2"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Cache Found</h3>
            <p className="text-gray-500">No dashboard cache exists yet. Cache will be created on the first dashboard request.</p>
          </div>
        </div>
      )}
    </div>
  );
}
