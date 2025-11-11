'use client';

import { useState } from 'react';
import TopSellingProducts from './Analytics/TopSellingProducts';
import LowSellingProducts from './Analytics/LowSellingProducts';
import ProductPerformance from './Analytics/ProductPerfomance';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('top-selling');

  const tabs = [
    { id: 'top-selling', label: 'Top Selling', component: TopSellingProducts },
    { id: 'low-selling', label: 'Low Selling', component: LowSellingProducts },
    { id: 'performance', label: 'Performance', component: ProductPerformance }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component; //Rendering the active component

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights into your product performance</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100">
        <nav className="flex flex-col sm:flex-row gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="animate-fadeIn">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}

