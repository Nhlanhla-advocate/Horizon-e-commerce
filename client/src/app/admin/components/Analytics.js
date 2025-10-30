'use client';

import { useState, useEffect } from 'react';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('top-selling');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'top-selling', label: 'Top Selling', component: TopSellingProducts },
    { id: 'low-selling', label: 'Low Selling', component: LowSellingProducts },
    { id: 'performance', label: 'Performance', component: ProductPerformance }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component; //Rendering the active component

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into your product performance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
        <nav className="flex flex-col sm:flex-row gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="animate-fadeIn">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

// Top Selling Products Component
function TopSellingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 10,
    days: 30,
    category: '',
    minRevenue: '',
    minQuantity: ''
  });

  useEffect(() => {
    fetchTopSellingProducts();
  }, [filters]);

  const fetchTopSellingProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/dashboard/analytics/top-selling?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch top selling products');
      }

      const data = await response.json();
      setProducts(data.data);
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Analytics Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={filters.days}
              onChange={(e) => setFilters({...filters, days: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Categories</option>
              <option value="jewelry">Jewelry</option>
              <option value="electronics">Electronics</option>
              <option value="consoles">Consoles</option>
              <option value="computers">Computers</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Revenue</label>
            <input
              type="number"
              value={filters.minRevenue}
              onChange={(e) => setFilters({...filters, minRevenue: e.target.value})}
              placeholder="Min revenue"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Quantity</label>
            <input
              type="number"
              value={filters.minQuantity}
              onChange={(e) => setFilters({...filters, minQuantity: e.target.value})}
              placeholder="Min quantity"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            </div>
            <h3 className="text-lg font-semibold text-white">Top Selling Products</h3>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <span className="text-gray-600">Loading analytics...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <div key={product._id} className="group flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-emerald-50 transition-all duration-300 border border-gray-200 hover:border-green-200">
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-800 transition-colors duration-200">{product.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {product.totalSold}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          Units Sold
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(product.totalRevenue)}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          Revenue
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {product.orderCount}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          Orders
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-500">No products found for the selected criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Low Selling Products Component
function LowSellingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 10,
    days: 30,
    category: '',
    maxSales: 5
  });

  useEffect(() => {
    fetchLowSellingProducts();
  }, [filters]);

  const fetchLowSellingProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/dashboard/analytics/low-selling?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch low selling products');
      }

      const data = await response.json();
      setProducts(data.data);
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
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period (days)</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Sales</label>
            <input
              type="number"
              value={filters.maxSales}
              onChange={(e) => setFilters({...filters, maxSales: e.target.value})}
              placeholder="Max sales"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="50">Top 50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Low Selling Products
          </h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Since Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          product.stock <= 10 ? 'text-red-600' : 
                          product.stock <= 20 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.totalSold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.daysSinceCreated} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <p className="text-gray-500 text-center py-8">No low selling products found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Performance Component
function ProductPerformance() {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchProductPerformance();
  }, [days]);

  const fetchProductPerformance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/analytics/performance?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product performance');
      }

      const data = await response.json();
      setPerformance(data.data);
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
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : performance ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Top Selling Products
              </h3>
              <div className="space-y-3">
                {performance.topSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {product.totalSold} sold
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(product.totalRevenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Category Performance
              </h3>
              <div className="space-y-3">
                {performance.categoryPerformance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 capitalize">{category.category}</h4>
                      <p className="text-xs text-gray-500">{category.productCount} products</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {category.totalSold} sold
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(category.totalRevenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{performance.totalActiveProducts}</div>
                  <div className="text-sm text-blue-800">Active Products</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{performance.lowStockCount}</div>
                  <div className="text-sm text-yellow-800">Low Stock Items</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{performance.categoryPerformance.length}</div>
                  <div className="text-sm text-green-800">Active Categories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
