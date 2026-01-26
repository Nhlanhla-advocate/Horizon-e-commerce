'use client';

import { useState, useEffect } from 'react';
import {
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
import '../../../assets/css/charts.css';
import '../../../assets/css/categoryPerfomanceCharts.css';

const BASE_URL = "http://localhost:5000";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function CategoryPerfomanceCharts() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState(null);
}

const fetchChartData = async () => {
    try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const response = await fetch(${BASE_URL}/dashboard/charts?period=365, {
            headers: {
                'Authorization': Bearer ${token},
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        if (data.success) {
            setChartData(data.data);
        } else {
            throw new Error(data.error || 'Failed to fetch data');
        }
    } catch (err) {
        setError(err.message);
        console.error('Error fetching chart data:', err);
    } finally {
        setLoading(false);
    }
};


}