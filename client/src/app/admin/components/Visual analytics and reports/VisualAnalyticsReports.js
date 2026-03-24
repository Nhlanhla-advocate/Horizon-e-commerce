'use client';

import { useState } from 'react';
import RevenueCharts from './RevenueCharts';
import CategoryPerfomanceCharts from './CategoryPerfomanceCharts';
import SalesTrends from './SalesTrends';
import '../../../assets/css/Analytics.css';

export default function VisualAnalyticsReports() {
    const [activeTab, setActiveTab] = useState('revenue');

    const tabs = [
        { id: 'revenue', label: 'Revenue Charts', component: RevenueCharts},
        { id: 'category', label: 'Category Performance', component: CategoryPerfomanceCharts},
        { id: 'sales', label: 'Sales Trends', component: SalesTrends }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="analytics-page-container">

            {/*Header*/}
            <div className="analytics-header">
                <div>
                    <h2 className="analytics-header-title">Visual Analytics & Reports</h2>
                    <p className="analytics-header-subtitle">Comprehensive visual insights into your business performance</p>
                </div>
            </div>

            {/*Tab Navigation*/}
            <div className="analytics-tabs-container">
                <nav className="analytics-tabs-nav">
                    {tabs.map((tab) =>(
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`analytics-tab-button ${activeTab === tab.id 
                            ? 'analytics-tab-button-active' 
                            : 'analytics-tab-button-inactive'
                        }`}
                    >
                        {tab.label}
                    </button>
                    ))}
                </nav>
            </div>

            {/*Content*/}
            <div className = 'analytics-content'>
                {ActiveComponent && <ActiveComponent />}
            </div>
        </div>
    );
}