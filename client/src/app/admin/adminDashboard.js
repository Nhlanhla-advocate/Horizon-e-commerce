'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from './components/DashboardStats';
import ProductManagement from './components/ProductManagement';
import Analytics from './components/Analytics';
import InventoryAlerts from './components/InventoryAlerts';
import ReviewManagement from './components/ReviewManagement';
import CacheManagement from './components/CacheManagement';
import Sidebar from './components/Sidebar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Longer delay to ensure tokens are persisted if coming from signin
      // This gives localStorage time to fully persist the tokens
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // If no token found, wait a bit more and check again (for timing issues)
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 300));
        token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      }
      
      if (!token) {
        console.log('No admin token found, redirecting to signin');
        router.push('/admin/signin');
        setLoading(false);
        return;
      }

      console.log('Token found, validating with server...');

      // Verify token is valid by checking admin profile
      try {
        const response = await fetch('http://localhost:5000/admin/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('Admin token validated successfully');
            setIsAuthenticated(true);
          } else {
            console.error('Token validation failed - invalid response:', data);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('token');
            router.push('/admin');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Token validation failed - HTTP error:', response.status, errorData);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
          router.push('/admin');
        }
      } catch (error) {
        console.error('Auth check failed with error:', error);
        // On network errors, don't immediately clear tokens - might be temporary
        // Only clear if it's clearly an auth error
        if (error.message && error.message.includes('401')) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
        }
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="flex w-full min-h-screen">
        <Sidebar 
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0 w-full min-w-0">
          {/* Main Content */}
          <main className="bg-gray-50 w-full overflow-x-hidden" style={{ width: '100%', maxWidth: '100%', padding: '0.75rem' }}>
            <div className="animate-fadeIn w-full" style={{ width: '100%', maxWidth: '100%', margin: 0 }}>
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
