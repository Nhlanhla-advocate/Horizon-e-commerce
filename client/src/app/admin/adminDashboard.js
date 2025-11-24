'use client';

import { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import ProductManagement from './components/ProductManagement';
import Analytics from './components/Analytics';
import InventoryAlerts from './components/InventoryAlerts';
import ReviewManagement from './components/ReviewManagement';
import CacheManagement from './components/CacheManagement';
import SidebarNavigation from './components/SidebarNavigation';

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

  // Ensure sidebar is open on desktop by default
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation Component */}
        <SidebarNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Modern Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Toggle menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {/* Welcome Message */}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin</h1>
                    <p className="text-gray-600 mt-1">Here are today's stats from your online store!</p>
                  </div>
                </div>
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
