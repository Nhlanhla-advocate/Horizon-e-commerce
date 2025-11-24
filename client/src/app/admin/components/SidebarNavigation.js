'use client';

export default function SidebarNavigation({ tabs, activeTab, onTabChange, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Dark Sidebar - Always visible on desktop, toggleable on mobile */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-72 h-screen bg-gray-900 transition-transform duration-300 ease-in-out shadow-xl flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <p className="text-xs text-gray-400 mt-1">Management Dashboard</p>
          </div>

          {/* Navigation Menu - Vertical Stack */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto flex flex-col">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex flex-col items-start px-4 py-3.5 rounded-lg text-left transition-all duration-200 group ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-blue-500 border-l-4 border-blue-500 shadow-md'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0 w-full">
                  <div className={`font-semibold text-sm leading-tight ${
                    activeTab === tab.id ? 'text-blue-400' : 'text-gray-200 group-hover:text-white'
                  }`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs mt-1 leading-relaxed ${
                    activeTab === tab.id ? 'text-blue-300' : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <div className="text-xs text-gray-400 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

