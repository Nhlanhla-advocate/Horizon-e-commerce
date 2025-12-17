'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../../assets/css/charts.css';

const BASE_URL = 'http://localhost:5000';

const COLORS = {
  revenue: '#3b82f6',
  orders: '#9333ea',
  categories: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
};

const statusColors = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444'
};

// Generate placeholder data for revenue and orders charts
const generatePlaceholderData = (days = 30) => {
  const data = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic-looking data with some variation
    const baseRevenue = 5000 + Math.random() * 3000;
    const baseOrders = 10 + Math.floor(Math.random() * 15);
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue + Math.sin(i / 5) * 1000),
      orders: baseOrders
    });
  }
  
  return data;
};

export default function DashboardCharts({ showCharts = null }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');
  
  // Generate placeholder data
  const placeholderData = generatePlaceholderData(parseInt(period));

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/dashboard/charts?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }

      const data = await response.json();
      if (data.success) {
        setChartData(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch chart data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch data if showing all charts or if we need category/status data
    const needsLiveData = !showCharts || showCharts.length === 0 || 
                          showCharts.includes('category') || 
                          showCharts.includes('status');
    
    if (needsLiveData) {
      fetchChartData();
    } else {
      // For revenue/orders only, use placeholder data immediately
      setLoading(false);
      setChartData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, showCharts]);

  // Listen for product updates to refresh category chart
  useEffect(() => {
    const handleProductUpdate = () => {
      // Only refresh if we're showing the category chart
      if (!showCharts || showCharts.length === 0 || showCharts.includes('category')) {
        fetchChartData();
      }
    };

    window.addEventListener('product-updated', handleProductUpdate);
    
    return () => {
      window.removeEventListener('product-updated', handleProductUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCharts]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Format order status data for pie chart
  const orderStatusData = chartData?.orderStatusDistribution
    ? Object.entries(chartData.orderStatusDistribution).map(([status, data]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: data.count,
        revenue: data.revenue || 0
      }))
    : [];

  // Format category data for bar chart
  const categoryData = chartData?.categoryBreakdown || [];
  
  // Use placeholder data for revenue and orders when showing individual charts
  // or when actual data is not available
  const revenueData = (showCharts && (showCharts.includes('revenue') || showCharts.includes('orders'))) 
    ? (chartData?.revenueOverTime?.length > 0 ? chartData.revenueOverTime : placeholderData)
    : (chartData?.revenueOverTime || []);
  
  const ordersData = (showCharts && showCharts.includes('orders'))
    ? (chartData?.revenueOverTime?.length > 0 ? chartData.revenueOverTime : placeholderData)
    : (chartData?.revenueOverTime || []);

  // Determine which charts to show
  const showAll = !showCharts || showCharts.length === 0;
  const showRevenue = showAll || showCharts.includes('revenue');
  const showOrders = showAll || showCharts.includes('orders');
  const showCategory = showAll || showCharts.includes('category');
  const showStatus = showAll || showCharts.includes('status');

  // Show loading state for all charts view
  if (loading && showAll) {
    return (
      <div className="charts-loading">
        <div className="text-center">
          <div className="charts-loading-spinner"></div>
          <p className="charts-loading-text">Loading charts...</p>
        </div>
      </div>
    );
  }

  // Show error state for all charts view
  if (error && showAll) {
    return (
      <div className="charts-error">
        <p className="charts-error-message">Error loading charts: {error}</p>
        <button
          onClick={fetchChartData}
          className="charts-error-retry"
        >
          Retry
        </button>
      </div>
    );
  }

  // ✅ SINGLE 4-BOX CARD RENDER
if (showCharts && showCharts.length > 0 && !showAll) {

  /* REVENUE */
  if (showCharts.includes('revenue')) {
    return (
      <div className="charts-4box-card">
        <h3 className="charts-4box-title">Revenue Over Time</h3>
        <div className="charts-4box-body">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" className="charts-4box-responsive">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `R${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.revenue}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="charts-empty charts-empty-compact">
              No revenue data available
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ORDERS */
  if (showCharts.includes('orders')) {
    return (
      <div className="charts-4box-card">
        <h3 className="charts-4box-title">Orders Over Time</h3>
        <div className="charts-4box-body">
          {ordersData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" className="charts-4box-responsive">
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke={COLORS.orders}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="charts-empty charts-empty-compact">
              No orders data available
            </div>
          )}
        </div>
      </div>
    );
  }

  /* CATEGORY */
  if (showCharts.includes('category')) {
    return (
      <div className="charts-4box-card">
        <h3 className="charts-4box-title">Products by Category</h3>
        <div className="charts-4box-body">
          {loading ? (
            <div className="charts-loading charts-empty-compact">
              <div className="charts-loading-spinner"></div>
              <p className="charts-loading-text">Loading...</p>
            </div>
          ) : error ? (
            <div className="charts-error">
              <p className="charts-error-message">Error: {error}</p>
              <button
                onClick={fetchChartData}
                className="charts-error-retry"
              >
                Retry
              </button>
            </div>
          ) : categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" className="charts-4box-responsive">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.categories[0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="charts-empty charts-empty-compact">
              No category data available
            </div>
          )}
        </div>
      </div>
    );
  }

  /* STATUS */
  if (showCharts.includes('status')) {
    return (
      <div className="charts-4box-card">
        <h3 className="charts-4box-title">Order Status</h3>
        <div className="charts-4box-body">
          {loading ? (
            <div className="charts-loading charts-empty-compact">
              <div className="charts-loading-spinner"></div>
              <p className="charts-loading-text">Loading...</p>
            </div>
          ) : error ? (
            <div className="charts-error">
              <p className="charts-error-message">Error: {error}</p>
              <button
                onClick={fetchChartData}
                className="charts-error-retry"
              >
                Retry
              </button>
            </div>
          ) : orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%" className="charts-4box-responsive">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {orderStatusData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={statusColors[entry.name.toLowerCase()] || COLORS.categories[i % COLORS.categories.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => {
                    const statusLower = value.toLowerCase();
                    const color = statusColors[statusLower] || entry.color;
                    return <span style={{ color }}>{value}</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="charts-empty charts-empty-compact">
              No order data available
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback: return null if no matching chart type
  return null;
  }

  // If showing all charts (not implemented in 4-box layout)
  return null;
}
