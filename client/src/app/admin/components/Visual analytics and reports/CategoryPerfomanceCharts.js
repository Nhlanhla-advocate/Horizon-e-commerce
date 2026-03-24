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
    const [error, setError] = useState(null);

    const fetchChartData = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/dashboard/charts?period=365`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
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

    useEffect(() => {
        fetchChartData();
    }, []);

    const categoryData = chartData?.categoryBreakdown || [];

    if (loading) {
        return (
            <div className="category-perfomance-loading">
                <div className="category-perfomance-text-center">
                    <div className="category-perfomance-loading-spinner"></div>
                    <p className="category-perfomance-loading-text">Loading category perfomance charts...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="category-perfomance-error">
                <p className="category-perfomance-error-message">Error loading charts: {error}</p>
                <button
                    onClick={fetchChartData}
                    className="category-perfomance-error-retry"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="category-perfomance-container">
            {/*Header*/}
            <div className="category-perfomance-header">
                <div>
                    <h2 className="category-perfomance-header-title">Category Perfomance</h2>
                    <p className="category-perfomance-header-subtitle">Analyze perfomance across product categories</p>
                </div>
            </div>

            {/*Charts Grid*/}
            <div className="category-perfomance-charts-grid">
                {/*Products by Category - Bar Chart*/}
                <div className="category-performance-chart-card">
                    <h3 className="category-performance-chart-title">Products by Category</h3>
                    <div className="category-performance-chart-container">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="category" 
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar 
                                        dataKey="count" 
                                        fill={COLORS[0]}
                                        name="Product Count"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="category-performance-empty">
                                No category data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Distribution - Pie Chart */}
                <div className="category-performance-chart-card">
                    <h3 className="category-performance-chart-title">Category Distribution</h3>
                    <div className="category-performance-chart-container">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="category-performance-empty">
                                No category data available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
