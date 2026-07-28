'use client';

import { useCallback, useEffect, useState } from 'react';
import { ADMIN_API_BASE, getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';

const API_KEYS_BASE = `${ADMIN_API_BASE}`/dashboard/super-admin/api-keys;

const DEFAULT_SCOPE_OPTIONS = [
  'manage_products',
  'manage_orders',
  'view_users',
  'manage_users',
  'handle_refunds',
  'manage_admins',
  'view_audit_logs',
  'view_system_activity',
  'view_failed_payments',
  'suspend_ban_users',
  'override_orders',
];

const EMPTY_FORM = {
  name: '',
  expiresInDays: '',
  scopes: [],
};

const btnCompact = { padding: '0.25rem 0.75rem', fontSize: '0.875rem' };

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

export default function ApiKeysPanel({ scopeOptions = DEFAULT_SCOPE_OPTIONS }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [createdRawKey, setCreatedRawKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch(API_KEYS_BASE, { headers: getAdminAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || `Failed to load API keys (${res.status})`);
      }
      setKeys(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setListError(err.message || 'Failed to load API keys');
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError(null);
  };

  const handleScopeToggle = (scope) => {
    setForm((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter((s) => s !== scope)
        : [...prev.scopes, scope],
    }));
    setSubmitError(null);
  };