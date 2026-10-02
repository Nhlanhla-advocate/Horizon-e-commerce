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
  ResponsiveContainer
} from 'recharts';
import '../../assets/css/charts.css';

// Same origin so Next.js rewrites /dashboard/* to the backend (avoids CORS / Failed to fetch)
const getBaseUrl = () => (typeof window !== 'undefined' ? '' : 'http://localhost:5000');

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

export default function DashboardCharts({ showCharts = null }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period] = useState('30');

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${getBaseUrl()}/dashboard/charts?period=${period}`, {
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
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, showCharts]);

  useEffect(() => {
    const handleProductUpdate = () => {
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

  const orderStatusData = chartData?.orderStatusDistribution
    ? Object.entries(chartData.orderStatusDistribution).map(([status, data]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: data.count,
        revenue: data.revenue || 0
      }))
    : [];

  const categoryData = chartData?.categoryBreakdown || [];
  const seriesData = chartData?.revenueOverTime || [];
  const revenueData = seriesData.some((item) => Number(item.revenue) > 0) ? seriesData : [];
  const ordersData = seriesData.some((item) => Number(item.orders) > 0) ? seriesData : [];

  const statusTotal = orderStatusData.reduce((sum, entry) => sum + Number(entry.value || 0), 0);
  const showAll = !showCharts || showCharts.length === 0;

  const chartState = () => {
    if (loading) {
      return (
        <div className="charts-loading charts-empty-compact">
          <div className="charts-loading-spinner"></div>
          <p className="charts-loading-text">Loading...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="charts-error">
          <p className="charts-error-message">Error: {error}</p>
          <button
            onClick={fetchChartData}
            className="charts-error-retry"
          >
            Retry
          </button>
        </div>
      );
    }
    return null;
  };

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

  if (showCharts && showCharts.length > 0 && !showAll) {
    const pendingState = chartState();

    if (showCharts.includes('revenue')) {
      return (
        <div className="charts-4box-card">
          <h3 className="charts-4box-title">Revenue Over Time</h3>
          <div className="charts-4box-body">
            {pendingState || (revenueData.length > 0 ? (
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
            ))}
          </div>
        </div>
      );
    }

    if (showCharts.includes('orders')) {
      return (
        <div className="charts-4box-card">
          <h3 className="charts-4box-title">Orders Over Time</h3>
          <div className="charts-4box-body">
            {pendingState || (ordersData.length > 0 ? (
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
            ))}
          </div>
        </div>
      );
    }

    if (showCharts.includes('category')) {
      return (
        <div className="charts-4box-card">
          <h3 className="charts-4box-title">Products by Category</h3>
          <div className="charts-4box-body">
            {pendingState || (categoryData.length > 0 ? (
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
            ))}
          </div>
        </div>
      );
    }

    if (showCharts.includes('status')) {
      return (
        <div className="charts-4box-card">
          <h3 className="charts-4box-title">Order Status</h3>
          <div className="charts-4box-body">
            {pendingState || (orderStatusData.length > 0 ? (
              <div className="charts-pie-layout">
                <div className="charts-pie-plot">
                  <ResponsiveContainer width="100%" height="100%" className="charts-4box-responsive">
                    <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={52}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={false}
                        labelLine={false}
                      >
                        {orderStatusData.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={statusColors[entry.name.toLowerCase()] || COLORS.categories[i % COLORS.categories.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const percent = statusTotal ? Math.round((Number(value) / statusTotal) * 100) : 0;
                          return [`${value} (${percent}%)`, name];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="charts-pie-legend">
                  {orderStatusData.map((entry, i) => {
                    const color = statusColors[entry.name.toLowerCase()] || COLORS.categories[i % COLORS.categories.length];
                    const percent = statusTotal ? Math.round((Number(entry.value) / statusTotal) * 100) : 0;
                    return (
                      <li key={entry.name} className="charts-pie-legend-item">
                        <span className="charts-pie-legend-swatch" style={{ backgroundColor: color }} />
                        <span>{entry.name} {percent}%</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="charts-empty charts-empty-compact">
                No order data available
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  }

  return null;
}
