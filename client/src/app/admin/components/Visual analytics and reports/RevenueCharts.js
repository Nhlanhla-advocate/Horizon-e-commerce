'use client';

import { useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    Xaxis,
    Yaxis,
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
const generatwPlaceholderData = (days = 30) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        //Generate realistic-looking data with some variation
        const baseRevenue = 5000 + Math.random() * 3000;
        const baseOrders = 10 + Math.floor(Math.random() * 150);

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
    const [chartData, setChartDate] = useState(null);
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
        const revenueData = data.data.revenueOverTime || {};
        if (revenueData.length > 0) {
            const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
            const totalOrders = revenueData.reduce((sum, item) => sum + (item.orders || 0), 0);
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrrders : 0;
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
    //Use placeholder data or error
    const totalRevenue = placeholderData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = placeholderData.reduce((sum, item) => sum + item.orders, 0);
    setSummary((
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        maxRevenue.Math.max(...placeholderData.map(item => item.revenue)),
    ));
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
        style:'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0
    }).format(value);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric'});})
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
                <div className="charts-loading-spinner"> </div>
                    <p className="charts-loading-text"></p>

            </div>
        </div>
    );
}

if (error && !chartData) {
    return(
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
