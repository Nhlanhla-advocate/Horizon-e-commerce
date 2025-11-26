'use client';

export default function SidebarNavigation({ tabs, activeTab, onTabChange, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Modern Sidebar - Clean UI Design */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:static inset-y-0 left-0 z-30 w-80 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out shadow-sm flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="px-6 py-8 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Panel</h2>
            <p className="text-sm text-gray-500 mt-1 font-normal">Management Dashboard</p>
          </div>

          {/* Navigation Menu - Vertical Stack */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="flex flex-col space-y-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3.5 rounded-xl text-left transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm leading-none ${
                        isActive ? 'text-blue-700' : 'text-gray-900 group-hover:text-gray-900'
                      }`}>
                        {tab.label}
                      </div>
                      <div className={`text-xs mt-1.5 leading-snug ${
                        isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="px-6 py-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
            <div className="flex items-center justify-center space-x-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-xs font-medium text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

