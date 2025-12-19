'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from './components/DashboardStats';
import ProductManagement from './components/Product management/ProductManagement';
import Analytics from './components/Analytics';
import InventoryAlerts from './components/InventoryAlerts';
import ReviewManagement from './components/ReviewManagement';
import CacheManagement from './components/CacheManagement';
import OrderManagement from './components/OrderManagement/OrderManagement';
import Sidebar from './components/Sidebar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Listen for tab changes from search bar
  useEffect(() => {
    const handleTabChange = (event) => {
      const tabId = event.detail;
      const validTabs = ['overview', 'products', 'analytics', 'inventory', 'reviews', 'cache', 'orders'];
      if (validTabs.includes(tabId)) {
        setActiveTab(tabId);
      }
    };

    window.addEventListener('admin-tab-change', handleTabChange);
    return () => window.removeEventListener('admin-tab-change', handleTabChange);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Longer delay to ensure tokens are persisted if coming from signin
      // This gives localStorage time to fully persist the tokens
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Prioritize adminToken - only check for admin token, not regular user token
      let adminToken = localStorage.getItem('adminToken');
      
      // If no admin token found, wait a bit more and check again (for timing issues)
      if (!adminToken) {
        await new Promise(resolve => setTimeout(resolve, 300));
        adminToken = localStorage.getItem('adminToken');
      }
      
      if (!adminToken) {
        console.log('No admin token found, redirecting to signin');
        // Clear any regular user tokens to prevent confusion
        localStorage.removeItem('token');
        router.push('/admin/signin');
        setLoading(false);
        return;
      }

      console.log('Admin token found, validating with server...');

      // Verify token is valid by checking admin profile
      try {
        const response = await fetch('http://localhost:5000/admin/profile', {
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            // Additional check: Verify the admin role is actually admin or super_admin
            if (data.admin.role && data.admin.role !== 'admin' && data.admin.role !== 'super_admin') {
              console.error('Token validation failed - user does not have admin role:', data.admin.role);
              localStorage.removeItem('adminToken');
              localStorage.removeItem('token');
              router.push('/admin/signin');
              return;
            }
            console.log('Admin token validated successfully');
            setIsAuthenticated(true);
          } else {
            console.error('Token validation failed - invalid response:', data);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('token');
            router.push('/admin/signin');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Token validation failed - HTTP error:', response.status, errorData);
          // If it's a 403 error, explicitly handle it as access denied
          if (response.status === 403) {
            console.error('Access denied - user does not have admin privileges');
          }
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
          router.push('/admin/signin');
        }
      } catch (error) {
        console.error('Auth check failed with error:', error);
        // Clear tokens on any error and redirect to signin
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        router.push('/admin/signin');
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
      id: 'orders',
      label: 'Orders',
      icon: '',
      component: OrderManagement,
      description: 'Manage orders'
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
    <div className="min-h-screen bg-gray-100 admin-dashboard-container w-full overflow-x-hidden" style={{ width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
      <div className="flex w-full min-h-screen" style={{ width: '100%', maxWidth: '100vw', boxSizing: 'border-box' }}>
        <Sidebar 
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 admin-main-content" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflow: 'hidden' }}>
          {/* Main Content */}
          <main className="bg-gray-50 admin-main w-full overflow-x-hidden" style={{ width: '100%', maxWidth: '100%', padding: '0.75rem', boxSizing: 'border-box' }}>
            <div className="animate-fadeIn w-full" style={{ width: '100%', maxWidth: '100%', margin: 0, boxSizing: 'border-box' }}>
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
