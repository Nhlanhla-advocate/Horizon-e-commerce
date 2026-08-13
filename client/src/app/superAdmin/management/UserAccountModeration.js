'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';
import '../../assets/css/admin.css';
import '../../assets/css/productManagement.css';
import '../../assets/css/userManagement.css';

const USERS_URL = '/dashboard/users';
const MODERATION_BASE = '/dashboard/super-admin/users';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
  { value: 'inactive', label: 'Inactive' },
];

const statusColor = (status) => {
  if (status === 'active') return '#059669';
  if (status === 'suspended') return '#d97706';
  if (status === 'banned') return '#dc2626';
  return '#6b7280';
};

const btnCompact = { padding: '0.25rem 0.75rem', fontSize: '0.875rem' };

/**
 * Lists registered customer emails and allows suspend/ban when the viewer
 * is a super_admin or has been granted suspend_ban_users.
 */
export default function UserAccountModeration({ canModerate = true }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [reasonModal, setReasonModal] = useState(null); // { user, action: 'suspend'|'ban' }
  const [reason, setReason] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAdminAuthHeaders();
      if (!headers.Authorization) {
        setError('Please sign in to view registered accounts.');
        setUsers([]);
        return;
      }
      const params = new URLSearchParams({ role: 'user' });
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch`(${USERS_URL}?${params.toString()}, { headers })`;
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || `Failed to load users (${res.status})`);
      }
      const data = await res.json();
      setUsers(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load registered accounts');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);