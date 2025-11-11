'use client';

import { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import ProductManagement from './components/ProductManagement';
import Analytics from './components/Analytics';
import InventoryAlerts from './components/InventoryAlerts';
import ReviewManagement from './components/ReviewManagement';
import CacheManagement from './components/CacheManagement';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: '',
      component: DashboardStats,
      description: 'Overview and statistics'
    },
    {
      id: 'products',
      label: 'Products',
      icon: '',
      component: ProductManagement,
      description: 'Manage inventory'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '',
      component: Analytics,
      description: 'Sales insights'
    },
    {
      id: 'inventory',
      label: 'Alerts',
      icon: '',
      component: InventoryAlerts,
      description: 'Stock alerts'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: '',
      component: ReviewManagement,
      description: 'Customer feedback'
    },
    {
      id: 'cache',
      label: 'Performance',
      icon: '',
      component: CacheManagement,
      description: 'System optimization'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  const isRenderable = typeof ActiveComponent === 'function';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Dark Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header removed per request */}

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-1">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {tab.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {tab.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0">
          {/* Modern Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Welcome Message */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin</h1>
                    <p className="text-gray-600 mt-1">Here are today's stats from your online store!</p>
                  </div>
                </div>
                
                {/* Right-side header elements removed per request */}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="bg-gray-50 min-h-screen p-8">
            <div className="animate-fadeIn">
              {isRenderable ? <ActiveComponent /> : null}
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
export default AdminDashboard;
