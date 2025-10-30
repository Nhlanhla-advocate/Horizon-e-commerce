
'use client';

import '../assets/css/admin.css';

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  );
}
