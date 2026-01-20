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
    }
}