'use client';

import '../assets/css/admin.css';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
