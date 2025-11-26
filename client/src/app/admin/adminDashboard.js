'use client';

import { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import ProductManagement from './components/ProductManagement';
import OrdersManagement from './components/OrdersManagement';
import Analytics from './components/Analytics';
import InventoryAlerts from './components/InventoryAlerts';
import ReviewManagement from './components/ReviewManagement';
import CacheManagement from './components/CacheManagement';
import SidebarNavigation from './components/SidebarNavigation';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Icon components for sidebar
  const DashboardIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const ProductsIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const OrdersIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );

  const AnalyticsIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  const AlertsIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );

  const ReviewsIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );

  const PerformanceIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  const tabs = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: DashboardIcon,
      component: DashboardStats,
      description: 'Overview and statistics'
    },
    {
      id: 'products',
      label: 'Products',
      icon: ProductsIcon,
      component: ProductManagement,
      description: 'Manage inventory'
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: OrdersIcon,
      component: OrdersManagement,
      description: 'Manage orders'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: AnalyticsIcon,
      component: Analytics,
      description: 'Sales insights'
    },
    {
      id: 'inventory',
      label: 'Alerts',
      icon: AlertsIcon,
      component: InventoryAlerts,
      description: 'Stock alerts'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: ReviewsIcon,
      component: ReviewManagement,
      description: 'Customer feedback'
    },
    {
      id: 'cache',
      label: 'Performance',
      icon: PerformanceIcon,
      component: CacheManagement,
      description: 'System optimization'
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;
  const isRenderable = typeof ActiveComponent === 'function';

  // Ensure sidebar is open on desktop by default
  useEffect(() => {
    const checkWidth = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Check immediately
    checkWidth();
    
    // Listen for resize events
    window.addEventListener('resize', checkWidth);
    
    return () => window.removeEventListener('resize', checkWidth);
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
