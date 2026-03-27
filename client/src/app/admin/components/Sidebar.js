'use client';

import { useState, useEffect, useRef } from 'react';
import '../../assets/css/sidebar.css';
import ThemeToggle from './ThemeToggle';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Sidebar({ tabs, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const [user, setUser] = useState(null);
  const profileRequestRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const loadAdminProfile = async () => {
      const requestId = ++profileRequestRef.current;
      const token = localStorage.getItem('adminToken');
      if (!token) {
        if (requestId === profileRequestRef.current) setUser(null);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          cache: 'no-store',
        });
        if (requestId !== profileRequestRef.current) return;
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        const latestToken = localStorage.getItem('adminToken');
        if (latestToken !== token) return;
        if (data?.success && data?.admin) {
          setUser(data.admin);
        } else {
          setUser(null);
        }
      } catch {
        if (requestId === profileRequestRef.current) setUser(null);
      }
    };

    const onStorage = (e) => {
      if (e.key === 'adminToken' || e.key === 'token' || e.key === 'adminRole') {
        loadAdminProfile();
      }
    };

    const onFocus = () => loadAdminProfile();

    loadAdminProfile();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'Admin';
  const displayName = user?.username || user?.email || 'Admin';
  const showEmail = user?.email && user?.username; // show email below when we have both (avoid duplicate when name is email)

  return (
    <>
      {/* Blue Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-container">
          {/* Navigation */}
          <nav className="admin-sidebar-nav">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`admin-sidebar-tab ${isActive ? 'active' : ''}`}
                >
                  <div className="admin-sidebar-tab-content">
                    <div className="admin-sidebar-tab-label">{tab.label}</div>
                    <div className="admin-sidebar-tab-description">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-footer-content">
              {user && (
                <div className="admin-sidebar-user">
                  <span className="admin-sidebar-user-role">{roleLabel}</span>
                  <span className="admin-sidebar-user-name">{displayName}</span>
                  {showEmail && (
                    <span className="admin-sidebar-user-email">{user.email}</span>
                  )}
                </div>
              )}
              <div className="admin-sidebar-footer-status">
                <div className="admin-sidebar-status-indicator"></div>
                <span>System Online</span>
              </div>
              <div className="admin-sidebar-footer-theme">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
