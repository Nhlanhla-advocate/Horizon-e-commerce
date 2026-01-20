'use client';

import { useState } from React;
import RevenueCharts from '.RevenueCharts';
import CategoryPerformanceCharts from './CategoryPerformance';
import SalesTrends from './SalesTrends';
import'../../../assets/analytics/visualanalytics.css';

export default function VisualAnalyticsReports() {
    const [activeTab, setActiveTab] = useState('revenue');
}