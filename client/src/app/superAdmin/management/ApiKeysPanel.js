'use client';

import { useCallback, useEffect, useState } from 'react';
import { ADMIN_API_BASE, getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';

const API_KEYS_BASE = `${ADMIN_API_BASE}/dashboard/super-admin/api-keys`;

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
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setCreatedRawKey(null);
    setCopied(false);

    if (!form.name?.trim()) {
      setSubmitError('API key name is required.');
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        scopes: form.scopes,
      };
      const days = Number(form.expiresInDays);
      if (Number.isInteger(days) && days >= 1 && days <= 365) {
        payload.expiresInDays = days;
      }

      const res = await fetch(API_KEYS_BASE, {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || `Create failed (${res.status})`);
      }

      setCreatedRawKey(data.key || null);
      setSuccessMessage(data.message || 'API key created successfully.');
      setForm(EMPTY_FORM);
      fetchKeys();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create API key');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (!createdRawKey) return;
    try {
      await navigator.clipboard.writeText(createdRawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setSubmitError('Could not copy to clipboard. Please copy the key manually.');
    }
  };

  const runKeyAction = async (keyId, action) => {
    setActionLoadingId(keyId);
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const options =
        action === 'delete'
          ? { method: 'DELETE', headers: getAdminAuthHeaders() }
          : { method: 'PATCH', headers: getAdminAuthHeaders() };

      const url =
        action === 'delete'
          ? `${API_KEYS_BASE}/${keyId}`
          : `${API_KEYS_BASE}/${keyId}/revoke`;

      const res = await fetch(url, options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || `${action} failed`);
      }
      setSuccessMessage(
        data.message || (action === 'delete' ? 'API key deleted.' : 'API key revoked.')
      );
      fetchKeys();
    } catch (err) {
      setSubmitError(err.message || `Failed to ${action} API key`);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="api-keys-panel">
      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <div className="product-management-header">
          <div>
            <h2 className="product-management-title">API keys</h2>
            <p className="product-management-subtitle">
              Create and manage API keys for integrations. The full key is shown only once after creation.
            </p>
          </div>
        </div>
      </div>

      {(submitError || listError) && (
        <div className="admin-alert admin-alert-error">{submitError || listError}</div>
      )}

      <AccountSuccessModal
        message={successMessage || ''}
        onClose={() => setSuccessMessage(null)}
      />

      {createdRawKey && (
        <div className="admin-card api-keys-reveal" style={{ borderRadius: '0.75rem' }}>
          <h3 className="product-management-form-title" style={{ marginBottom: '0.5rem' }}>
            New API key — copy it now
          </h3>
          <p className="product-management-subtitle" style={{ marginBottom: '0.75rem' }}>
            This secret will not be shown again. Store it in a secure place.
          </p>
          <div className="api-keys-reveal-row">
            <code className="api-keys-reveal-value">{createdRawKey}</code>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              style={btnCompact}
              onClick={handleCopyKey}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              style={btnCompact}
              onClick={() => {
                setCreatedRawKey(null);
                setCopied(false);
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

<div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <h2 className="product-management-title" style={{ marginBottom: '1rem' }}>
          Create API key
        </h2>
        <form onSubmit={handleCreate} className="product-management-form">
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="api-key-name">
              Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="api-key-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Inventory sync"
              required
              maxLength={100}
              className="admin-form-input"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="api-key-expiry">
              Expires in (days)
            </label>
            <input
              id="api-key-expiry"
              type="number"
              name="expiresInDays"
              value={form.expiresInDays}
              onChange={handleChange}
              placeholder="Default from security policy"
              min={1}
              max={365}
              className="admin-form-input"
            />
          </div>
          <div className="admin-form-group product-management-form-field-full">
            <label className="admin-form-label">Scopes (optional)</label>
            <p className="product-management-subtitle" style={{ marginBottom: '0.5rem' }}>
              Limit what this key can access.
            </p>
            <div className="manage-permission-grid">
              {scopeOptions.map((scope) => (
                <label key={scope} className="manage-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.scopes.includes(scope)}
                    onChange={() => handleScopeToggle(scope)}
                  />
                  <span className="manage-checkbox-text">{scope}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="product-management-form-actions">
            <button
              type="submit"
              disabled={submitLoading}
              className="admin-btn admin-btn-primary"
            >
              {submitLoading ? 'Creating...' : 'Create API key'}
            </button>
          </div>
        </form>
      </div>