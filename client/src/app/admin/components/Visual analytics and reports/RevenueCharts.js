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

    const data = await response,json();
    if (data.success) {
        setChartData(data.data);
    }
   }
}