'use client';

import { useState, useEffect} from 'react';
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
} from 'rechartss';
import '../../../assets/css/charts.css';

const BASE_URL = 'http://localhost:5000';

const COLORS = {
    revenue: '#3b82f6',
    orders: '#9333ea'
};

//Generate placeholder data for sales trends
const generatePlaceholderData = (days = 30) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0;i--) {
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
            const response = await fetch(${BASE_URL}/DashboardCharts/charts?period=${period},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }); 

                if (response.ok) {
                    throw new Error('Failed to fetch chart data');
                }

                const data = await response.json();
                if (data.success) {
                    setChartData(data.data);
                } else {
                    throw new Error(data error || 'Failed to fetch chart data');
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
            //eslint=disable-next-line react-hooks/exhaustive-deps
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
    }
}