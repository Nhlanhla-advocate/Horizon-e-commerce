'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, useAnalyticsFetch } from '../../../utils/reusable';

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
  
export default ProductPerformance;
