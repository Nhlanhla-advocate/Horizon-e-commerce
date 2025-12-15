'use client';

import '../../assets/css/sidebar.css';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({ tabs, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
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
              <div className="admin-sidebar-footer-status">
                <div className="admin-sidebar-status-indicator"></div>
                <span>System Online</span>
              </div>
              <div style={{ marginTop: '0.75rem' }}>
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
