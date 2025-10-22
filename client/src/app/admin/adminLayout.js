// src/app/admin/layout.js
'use client';

import Link from 'next/link';
import '../../assets/css/admin.css';

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>
          <nav className="flex flex-col space-y-4">
            <Link href="/admin">🏠 Dashboard</Link>
            <Link href="/admin/products">📦 Products</Link>
            <Link href="/admin/orders">🧾 Orders</Link>
            <Link href="/admin/users">👥 Users</Link>
            <Link href="/admin/settings">⚙️ Settings</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
