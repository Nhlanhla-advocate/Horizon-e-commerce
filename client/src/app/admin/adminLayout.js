'use client';

import '../assets/css/admin.css';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100" style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {children}
    </div>
  );
}
