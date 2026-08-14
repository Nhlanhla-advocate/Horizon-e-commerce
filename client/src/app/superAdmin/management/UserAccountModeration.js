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
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const runModeration = async (user, action, reasonText = '') => {
    setActionLoadingId(user._id);
    setError(null);
    try {
      const headers = getAdminAuthHeaders();
      const res = await fetch(${MODERATION_BASE}/${user._id}/${action}, {
        method: 'POST',
        headers,
        body: JSON.stringify(reasonText ? { reason: reasonText } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || Failed to ${action} user);
      }
      setSuccessMessage(data.message || User ${action}ed successfully.);
      setReasonModal(null);
      setReason('');
      await fetchUsers();
    } catch (err) {
      setError(err.message || Failed to ${action} user);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openReasonModal = (user, action) => {
    setReason('');
    setReasonModal({ user, action });
  };

  const confirmReasonAction = () => {
    if (!reasonModal) return;
    runModeration(reasonModal.user, reasonModal.action, reason.trim());
  };

  if (!canModerate) {
    return (
      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <h2 className="product-management-title">Registered accounts</h2>
        <p className="product-management-subtitle" style={{ marginBottom: 0 }}>
          You do not have permission to suspend or ban customer accounts. Ask a super admin to grant{' '}
          <strong>Suspend / ban customer accounts</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="product-management-container" style={{ padding: 0 }}>
      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <h2 className="product-management-title">Registered customer accounts</h2>
        <p className="product-management-subtitle" style={{ marginBottom: 0 }}>
          Emails of accounts registered on the site. Suspend or ban customers from here.
        </p>
      </div>

      <div className="product-management-search-container">
        <div className="product-management-search-wrapper" style={{ marginBottom: '0.75rem' }}>
          <svg
            className="product-management-search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="product-management-search-input"
            placeholder="Search by email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="product-management-search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label className="filter-label" style={{ marginRight: '0.5rem' }}>
              Status
            </label>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      