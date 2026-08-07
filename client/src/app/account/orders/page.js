'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderHistorySection from '@/app/components/accounts/OrderHistorySection';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';
import '@/app/assets/css/userAccount.css';

const normalizeRole = (roleValue) =>
  String(roleValue || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const ADMIN_ROLES = new Set(['admin', 'super_admin', 'manager', 'support']);

export default function AccountOrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      router.replace('/auth/signin?redirect=/account/orders');
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
        <div className="user-account-loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="user-account-page">
      <header className="user-account-header">
        <h1>My orders</h1>
        <p>Review everything you have purchased, cancelled, or still in progress.</p>
      </header>

      {error && <div className="user-account-alert user-account-alert--error">{error}</div>}

      <AccountSuccessModal message={success || ''} onClose={() => setSuccess('')} />

      <OrderHistorySection
        onError={setError}
        onSuccess={setSuccess}
        title="Purchase log"
        subtitle="Filter by status to find delivered, cancelled, or in-progress orders."
        showBackLink
      />
    </div>
  );
}
