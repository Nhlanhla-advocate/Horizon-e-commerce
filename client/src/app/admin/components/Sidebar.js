'use client';

import { useState, useEffect } from 'react';
import '../../assets/css/sidebar.css';
import ThemeToggle from './ThemeToggle';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Sidebar({ tabs, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('token')) : null;
    if (!token) return;
    fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.success && data?.admin) setUser(data.admin);
      })
      .catch(() => {});
  }, []);

  const roleLabel = user?.role === 'super_admin' ? 'Super Admin' : 'Admin';
  const displayName = user?.username || user?.email || 'Admin';

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
