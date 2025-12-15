'use client';

import '../assets/css/admin.css';
import { ThemeProvider } from './context/ThemeContext';

export default function AdminLayout({ children }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 admin-layout" style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
        {children}
      </div>
    </ThemeProvider>
  );
}
