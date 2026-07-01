'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ADMIN_API_BASE } from '@/app/utils/adminRoutes';
import '../../assets/css/superAdmin.css';

const NAV_ITEMS = [
  { href: '/superAdmin/account', label: 'My Account' },
  { href: '/admin?tab=super-admin', label: 'Staff Management' },
];

export default function SuperAdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) {
      router.replace('/superAdmin/signin');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${ADMIN_API_BASE}/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          router.replace('/superAdmin/signin');
          return;
        }
        const data = await res.json();
        const role = data.admin?.role;
        if (role !== 'super_admin') {
          router.replace('/admin');
          return;
        }
        setProfile(data.admin);
      } catch {
        router.replace('/superAdmin/signin');
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

 const handleLogout = async () => {
  const token = localStorage.getItem('AdminToken');
  if (token) {
    await fetch(`${ADMIN_API_BASE}/admin/signout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }).catch(() => {});
  }
  localStorage.removeItem('AdminToken');
  localStorage.removeItem('token');
  localStorage.removeItem('adminRole');
  router.push('/superAdmin/signin');
  };

  if (checking) {
    return (
      <div className="super-admin-shell super-admin-shell-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="super-admin-shell">
      <header className="super-admin-shell-header">
        <div className="super-admin-shell-brand">
          <h1>Super Admin</h1>
          {profile && (
            <span className="super-admin-shell-user">{profile.username || profile.email}</span>
          )}
        </div>
        <nav className="super-admin-shell-nav">
          {NAV_ITEMS.map((item) => (
            <Link
            key={item.href}
            href={item.href}
            className={`super-admin-shell-nav-link${pathname === item.href ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="super-admin-shell-actions">
          <Link href="/admin" className="super-admin-shell-link">Admin Dashboard"</Link>
          <Link href="/" className="super-admin-shell-link">Store</Link>
          <button type="button" className="super-admin-shell-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="super-admin-shell-main">{children}</main>
    </div>
  );
 }