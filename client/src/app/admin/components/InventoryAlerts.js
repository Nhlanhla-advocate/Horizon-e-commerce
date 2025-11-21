'use client'

import { useState, useEffect } from 'react';

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
                    return 'bg-red-100 border-red-200 text-red-800';
                case 'warning':
                    return 'bg-yellow-100 border-yellow-200 text-yellow-800';
                case 'low':
                    return 'bg-blue-100 border-blue-200 text-blue-800';
                default:
                    return 'bg-gray-100 border-gray-200 text-gray-800';
            }
        };

        return (
            <div className="space-y-8">
                 {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Alerts</h2>
          <p className="text-gray-600 mt-1">Monitor stock levels and manage inventory alerts</p>
        </div>
        <button
          onClick={fetchLowStockAlerts}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-300 disabled:to-purple-400 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 self-start sm:self-auto"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <span className="text-lg"></span>
          )}
          <span>Refresh Alerts</span>
        </button>
      </div>


      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Alerts</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">{summary.total}</dd>
                  </dl>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>


          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Critical</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">{summary.critical}</dd>
                  </dl>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>


          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Warning</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">{summary.warning}</dd>
                  </dl>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>


          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Low</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">{summary.low}</dd>
                  </dl>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>


          <div className="group bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Out of Stock</dt>
                    <dd className="text-2xl font-bold text-gray-900 mt-1">{summary.outOfStock}</dd>
                  </dl>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Threshold</label>
            <input
              type="number"
              value={filters.threshold}
              onChange={(e) => setFilters({...filters, threshold: e.target.value})}
              placeholder="Stock threshold"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Period (days)</label>
            <select
              value={filters.days}
              onChange={(e) => setFilters({...filters, days: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Categories</option>
              <option value="jewelry">Jewelry</option>
              <option value="electronics">Electronics</option>
              <option value="consoles">Consoles</option>
              <option value="computers">Computers</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ threshold: 10, days: 30, category: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>


      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}


      {/* Alerts Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Low Stock Alerts
          </h3>
         
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reorder Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Daily Sales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Until Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                      </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alerts.map((alert) => (
                    <tr key={alert._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getAlertColor(alert.alertLevel)}`}>
                          <span className="mr-1">{getAlertIcon(alert.alertLevel)}</span>
                          {alert.alertLevel}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{alert.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {alert.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${
                          alert.stock === 0 ? 'text-red-600' :
                          alert.stock <= 5 ? 'text-red-500' :
                          alert.stock <= 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {alert.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.reorderLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.averageDailySales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {alert.estimatedDaysUntilOutOfStock !== null ? (
                          <span className={`text-sm font-medium ${
                            alert.estimatedDaysUntilOutOfStock <= 7 ? 'text-red-600' :
                            alert.estimatedDaysUntilOutOfStock <= 14 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {alert.estimatedDaysUntilOutOfStock} days
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alert.totalSold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(alert.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {alerts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No low stock alerts found!</p>
                  <p className="text-gray-400 text-sm">All products are well stocked.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* Action Buttons */}
      {alerts.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Quick Actions</h4>
              <p className="text-sm text-gray-500">Manage your inventory alerts</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Export Alerts
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Generate Purchase Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}