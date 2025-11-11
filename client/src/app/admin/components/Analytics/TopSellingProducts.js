'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, useAnalyticsFetch } from '../../../utils/reusable';

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
  
export default TopSellingProducts;
  