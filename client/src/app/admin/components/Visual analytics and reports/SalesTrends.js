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