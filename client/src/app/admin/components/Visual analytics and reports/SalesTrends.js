'use client';

import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import '../../../assets/css/charts.css';
import '../../../assets/css/salesTrends.css';

const BASE_URL = 'http://localhost:5000';

const COLORS = {
    revenue: '#3b82f6',
    orders: '#9333ea'
};

//Generate placeholder data for sales trends
const generatePlaceholderData = (days = 30) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

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

export default function SalesTrends() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('30');

    const placeholderData = generatePlaceholderData(parseInt(period));

    const fetchChartData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/dashboard/charts?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
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
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [period]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
    };

    const revenueData = chartData?.revenueOverTime?.length > 0
        ? chartData.revenueOverTime
        : placeholderData;

    if (loading) {
        return (
            <div className="sales-trends-loading">
                <div className="sales-trends-text-center">
                    <div className="sales-trends-loading-spinner"></div>
                    <p className="sales-trends-loading-text">Loading sales trends...</p>
                </div>
            </div>
        );
    }

    if (error && !chartData) {
        return (
            <div className="sales-trends-error">
                <p className="sales-trends-error-message">Error loading charts: {error}</p>
                <button
                    onClick={fetchChartData}
                    className="sales-trends-error-retry"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="sales-trends-container">
            {/*Header*/}
            <div className="sales-trends-header">
                <div>
                    <h2 className="sales-trends-header-title">Sales Trends</h2>
                    <p className="sales-trends-header-subtitle">Track sales performance and identify trends</p>
                </div>
                <div className="sales-trends-period-selector">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="sales-trends-period-select"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="180">Last 6 months</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            {/*Charts Grid*/}
            <div className="sales-trends-charts-grid">
                {/*Sales Trend - Line Chart*/}
                <div className="sales-trends-chart-card">
                    <h3 className="sales-trends-chart-title">Sales Trend Over Time</h3>
                    <div className="sales-trends-chart-container">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        formatter={(value) => formatCurrency(value)}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={COLORS.revenue}
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        name="Revenue"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="sales-trends-empty">
                                No sales data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Orders Trend */}
                <div className="sales-trends-chart-card">
                    <h3 className="sales-trends-chart-title">Orders Trend</h3>
                    <div className="sales-trends-chart-container">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="orders"
                                        stroke={COLORS.orders}
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        name="Orders"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="sales-trends-empty">
                                No orders data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
