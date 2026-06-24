'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ADMIN_ROUTES } from '@/app/utils/adminRoutes';
import '../../assets/css/superAdmin.css';

const NAV_ITEMS = [
    { href: '/superAdmin/account', label: 'My Account' },
    { href: '/superAdmin/management', label: 'Staff Management' },
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
          const res = await fetch(${ADMIN_API_BASE}/admin/profile, {
            headers: { Authorization: Bearer ${token} },
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