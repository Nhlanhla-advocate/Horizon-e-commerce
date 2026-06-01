'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import UserAccount from '@/app/components/accounts/userAccount';

const normalizeRole = (roleValue) =>
  String(roleValue || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const ADMIN_ROLES = new Set(['admin', 'super_admin', 'manager', 'support']);

export default function AccountPage() {
  const router = useRouter();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let token = null;
    let adminToken = null;
    let adminRole = '';

    try {
      token = localStorage.getItem('token');
      adminToken = localStorage.getItem('adminToken');
      adminRole = normalizeRole(localStorage.getItem('adminRole'));
    } catch {
      token = null;
    }

    if (!token) {
      router.replace('/auth/signin?redirect=/account');
      return;
    }

    if (adminToken || ADMIN_ROLES.has(adminRole)) {
      router.replace('/admin');
      return;
    }

    setStatus('allowed');
  }, [router]);

  if (status !== 'allowed') {
    return (
      <div className="user-account-page">
        <div className="user-account-loading">Loading your account...</div>
      </div>
    );
  }

  return <UserAccount />;
}
