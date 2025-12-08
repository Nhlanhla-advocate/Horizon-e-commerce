'use client';

import { useState } from 'react';
import TopSellingProducts from './Analytics/TopSellingProducts';
import LowSellingProducts from './Analytics/LowSellingProducts';
import ProductPerformance from './Analytics/ProductPerfomance';
import '../../assets/css/Analytics.css';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('top-selling');

  const tabs = [
    { id: 'top-selling', label: 'Top Selling', component: TopSellingProducts },
    { id: 'low-selling', label: 'Low Selling', component: LowSellingProducts },
    { id: 'performance', label: 'Performance', component: ProductPerformance }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component; //Rendering the active component

  return (
    <div className="analytics-page-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-header-title">Product Analytics</h2>
          <p className="analytics-header-subtitle">Comprehensive insights into your product performance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs-container">
        <nav className="analytics-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`analytics-tab-button ${
                activeTab === tab.id
                  ? 'analytics-tab-button-active'
                  : 'analytics-tab-button-inactive'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="analytics-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

