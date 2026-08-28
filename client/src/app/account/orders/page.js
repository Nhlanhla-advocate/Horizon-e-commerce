'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OrderHistorySection from '@/app/components/accounts/OrderHistorySection';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';
import '@/app/assets/css/userAccount.css';

const normalizeRole = (roleValue) =>
  String(roleValue || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const ADMIN_ROLES = new Set(['admin', 'super_admin', 'manager', 'support']);

function AccountOrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const placedOrderId = searchParams.get('orderId') || '';

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
    if (searchParams.get('placed') === '1') {
      setSuccess('Payment received. Your checked-out items are listed below.');
    }
  }, [router, searchParams]);

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
        subtitle="Each order lists the items you checked out, including pending and processing purchases."
        showBackLink
        highlightOrderId={placedOrderId}
      />
    </div>
  );
}

export default function AccountOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="user-account-page">
          <div className="user-account-loading">Loading your orders...</div>
        </div>
      }
    >
      <AccountOrdersPageContent />
    </Suspense>
  );
}
