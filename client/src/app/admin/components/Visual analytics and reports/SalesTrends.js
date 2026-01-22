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

    for (let i = days - 1; 1 >= 0;i--) {
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
}