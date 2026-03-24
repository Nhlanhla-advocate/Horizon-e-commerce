'use client';

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import '../../../assets/css/charts.css';

const BASE_URL = 'http://localhost:5000';

const COLORS = {
    revenue: '#3b82f6',
    revenueSecondary: '#60a5fa',
    orders: '#9333ea',
    gradientStart: '#3b82f6',
    gradientEnd: '#60a5fa'
};

//Generate placeholder data for revenue charts
const generatePlaceholderData = (days = 30) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        //Generate realistic-looking data with some variation
        const baseRevenue = 5000 + Math.random() * 3000;
        const baseOrders = 10 + Math.floor(Math.random() * 15);

        data.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.round(baseRevenue + Math.sin(i/5) * 1000),
            orders: baseOrders,
            avgOrderValue: Math.round((baseRevenue + Math.sin(i / 5) * 1000) / baseOrders)
        });
    }

    return data;
};

export default function RevenueCharts() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('30');
    const [summary, setSummary] = useState(null);

    //Generate placeholder data
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

                //Calculate summary statistics
                const revenueData = data.data?.revenueOverTime || [];
                if (revenueData.length > 0) {
                    const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
                    const totalOrders = revenueData.reduce((sum, item) => sum + (item.orders || 0), 0);
                    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
                    const maxRevenue = Math.max(...revenueData.map(item => item.revenue || 0));
                    const minRevenue = Math.min(...revenueData.map(item => item.revenue || 0));

                    setSummary({
                        totalRevenue,
                        totalOrders,
                        avgOrderValue,
                        maxRevenue,
                        minRevenue
                    });
                }
            } else {
                throw new Error(data.error || 'Failed to fetch chart data');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching chart data:', err);
            //Use placeholder data on error
            const totalRevenue = placeholderData.reduce((sum, item) => sum + item.revenue, 0);
            const totalOrders = placeholderData.reduce((sum, item) => sum + item.orders, 0);
            setSummary({
                totalRevenue,
                totalOrders,
                avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                maxRevenue: Math.max(...placeholderData.map(item => item.revenue)),
                minRevenue: Math.min(...placeholderData.map(item => item.revenue))
            });
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

    //Use actual data if available, otherwise use placeholder
    const revenueData = chartData?.revenueOverTime?.length > 0
        ? chartData.revenueOverTime
        : placeholderData;

    //Calculate revenue with orders for combined chart
    const combinedData = revenueData.map(item => ({
        ...item,
        revenueFormatted: formatCurrency(item.revenue)
    }));

    if (loading) {
        return (
            <div className="charts-loading">
                <div className="text-center">
                    <div className="charts-loading-spinner"></div>
                    <p className="charts-loading-text">Loading revenue charts...</p>
                </div>
            </div>
        );
    }

    if (error && !chartData) {
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

    return (
        <div className="analytics-page-container">
            {/*Header*/}
            <div className="analytics-header">
                <div>
                    <h2 className="analytics-header-title">Revenue Analytics</h2>
                    <p className="analytics-header-subtitle">Comprehensive revenue insights and trends</p>
                </div>
                <div className="charts-period-selector">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="charts-period-select"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="180">Last 6 months</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>

            {/*SummaryCards*/}
            {summary && (
                <div className="performance-summary-grid">
                    <div className="performance-stat-card performance-stat-card-blue">
                        <div className="performance-stat-value performance-stat-value-blue">
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                        <div className="performance-stat-label performance-stat-label-blue">Total Revenue</div>
                    </div>
                    <div className="performance-stat-card performance-stat-card-green">
                        <div className="performance-stat-value performance-stat-value-green">
                            {summary.totalOrders}
                        </div>
                        <div className="performance-stat-label performance-stat-label-green">Total Orders</div>
                    </div>
                    <div className="performance-stat-card performance-stat-card-yellow">
                        <div className="performance-stat-value performance-stat-value-yellow">
                            {formatCurrency(summary.avgOrderValue)}
                        </div>
                        <div className="performance-stat-label performance-stat-label-yellow">Average Order Value</div>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Revenue Over Time - Line Chart */}
                <div className="chart-card">
                    <h3 className="chart-title-large">Revenue Over Time</h3>
                    <div className="chart-container">
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
                            <div className="charts-empty charts-empty-large">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue Over Time - Area Chart */}
                <div className="chart-card">
                    <h3 className="chart-title-large">Revenue Trend (Area)</h3>
                    <div className="chart-container">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.gradientStart} stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor={COLORS.gradientEnd} stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
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
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={COLORS.revenue}
                                        strokeWidth={2}
                                        fill="url(#revenueGradient)"
                                        name="Revenue"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="charts-empty charts-empty-large">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue vs Orders - Combined Chart */}
                <div className="chart-card">
                    <h3 className="chart-title-large">Revenue vs Orders</h3>
                    <div className="chart-container">
                        {combinedData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={combinedData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={formatDate}
                                    />
                                    <YAxis 
                                        yAxisId="left"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(v) => `R${(v / 1000).toFixed(0)}k`}
                                    />
                                    <YAxis 
                                        yAxisId="right"
                                        orientation="right"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip 
                                        formatter={(value, name) => {
                                            if (name === 'revenue') return formatCurrency(value);
                                            return value;
                                        }}
                                        labelFormatter={(label) => formatDate(label)}
                                    />
                                    <Legend />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke={COLORS.revenue}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        name="Revenue"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="orders"
                                        stroke={COLORS.orders}
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                        name="Orders"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="charts-empty charts-empty-large">
                                No data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue Bar Chart */}
                <div className="chart-card">
                    <h3 className="chart-title-large">Daily Revenue (Bar Chart)</h3>
                    <div className="chart-container">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="date" 
                                        tick={{ fontSize: 10 }}
                                        tickFormatter={formatDate}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
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
                                    <Bar 
                                        dataKey="revenue" 
                                        fill={COLORS.revenue}
                                        name="Revenue"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="charts-empty charts-empty-large">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
