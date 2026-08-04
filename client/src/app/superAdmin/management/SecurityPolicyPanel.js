'use client';

import { useCallback, useEffect, useState } from 'react';
import { ADMIN_API_BASE, getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';

const POLICY_URL = `${ADMIN_API_BASE}/dashboard/super-admin/security-policy`;

const DEFAULT_FORM = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: true,
  sessionTimeoutMinutes: 1440,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 30,
  requireTwoFactorForAdmins: false,
  requireTwoFactorForSuperAdmins: true,
  ipAllowlistText: '',
  apiKeyDefaultExpiryDays: 90,
};

function policyToForm(policy = {}) {
  const list = Array.isArray(policy.ipAllowlist) ? policy.ipAllowlist : [];
  return {
    passwordMinLength: policy.passwordMinLength ?? DEFAULT_FORM.passwordMinLength,
    passwordRequireUppercase: Boolean(policy.passwordRequireUppercase ?? DEFAULT_FORM.passwordRequireUppercase),
    passwordRequireNumber: Boolean(policy.passwordRequireNumber ?? DEFAULT_FORM.passwordRequireNumber),
    passwordRequireSpecial: Boolean(policy.passwordRequireSpecial ?? DEFAULT_FORM.passwordRequireSpecial),
    sessionTimeoutMinutes: policy.sessionTimeoutMinutes ?? DEFAULT_FORM.sessionTimeoutMinutes,
    maxLoginAttempts: policy.maxLoginAttempts ?? DEFAULT_FORM.maxLoginAttempts,
    lockoutDurationMinutes: policy.lockoutDurationMinutes ?? DEFAULT_FORM.lockoutDurationMinutes,
    requireTwoFactorForAdmins: Boolean(policy.requireTwoFactorForAdmins ?? DEFAULT_FORM.requireTwoFactorForAdmins),
    requireTwoFactorForSuperAdmins: Boolean(
      policy.requireTwoFactorForSuperAdmins ?? DEFAULT_FORM.requireTwoFactorForSuperAdmins
    ),
    ipAllowlistText: list.join('\n'),
    apiKeyDefaultExpiryDays: policy.apiKeyDefaultExpiryDays ?? DEFAULT_FORM.apiKeyDefaultExpiryDays,
  };
}

function parseIpAllowlist(text) {
  return String(text || '')
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function SecurityPolicyPanel() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(POLICY_URL, { headers: getAdminAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || `Failed to load security policy (${res.status})`);
      }
      setForm(policyToForm(data.data || {}));
    } catch (err) {
      setLoadError(err.message || 'Failed to load security policy');
      setForm(DEFAULT_FORM);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    setSubmitError(null);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
    setSubmitError(null);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    const passwordMinLength = Number(form.passwordMinLength);
    const sessionTimeoutMinutes = Number(form.sessionTimeoutMinutes);
    const maxLoginAttempts = Number(form.maxLoginAttempts);
    const lockoutDurationMinutes = Number(form.lockoutDurationMinutes);
    const apiKeyDefaultExpiryDays = Number(form.apiKeyDefaultExpiryDays);

    if (!Number.isInteger(passwordMinLength) || passwordMinLength < 6 || passwordMinLength > 128) {
      setSubmitError('Password minimum length must be an integer between 6 and 128.');
      return;
    }
    if (!Number.isInteger(sessionTimeoutMinutes) || sessionTimeoutMinutes < 15 || sessionTimeoutMinutes > 10080) {
      setSubmitError('Session timeout must be an integer between 15 and 10080 minutes.');
      return;
    }
    if (!Number.isInteger(maxLoginAttempts) || maxLoginAttempts < 3 || maxLoginAttempts > 20) {
      setSubmitError('Max login attempts must be an integer between 3 and 20.');
      return;
    }
    if (!Number.isInteger(lockoutDurationMinutes) || lockoutDurationMinutes < 5 || lockoutDurationMinutes > 1440) {
      setSubmitError('Lockout duration must be an integer between 5 and 1440 minutes.');
      return;
    }
    if (!Number.isInteger(apiKeyDefaultExpiryDays) || apiKeyDefaultExpiryDays < 1 || apiKeyDefaultExpiryDays > 365) {
      setSubmitError('API key default expiry must be an integer between 1 and 365 days.');
      return;
    }

    const payload = {
      passwordMinLength,
      passwordRequireUppercase: Boolean(form.passwordRequireUppercase),
      passwordRequireNumber: Boolean(form.passwordRequireNumber),
      passwordRequireSpecial: Boolean(form.passwordRequireSpecial),
      sessionTimeoutMinutes,
      maxLoginAttempts,
      lockoutDurationMinutes,
      requireTwoFactorForAdmins: Boolean(form.requireTwoFactorForAdmins),
      requireTwoFactorForSuperAdmins: Boolean(form.requireTwoFactorForSuperAdmins),
      ipAllowlist: parseIpAllowlist(form.ipAllowlistText),
      apiKeyDefaultExpiryDays,
    };

    setSubmitLoading(true);
    try {
      const res = await fetch(POLICY_URL, {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          throw new Error(data.errors.map((entry) => entry.msg).join(' '));
        }
        throw new Error(data.message || data.error || `Failed to update security policy (${res.status})`);
      }
      setForm(policyToForm(data.data || payload));
      setSuccessMessage(data.message || 'Security policy updated.');
    } catch (err) {
      setSubmitError(err.message || 'Failed to update security policy');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="security-policy-panel">
      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <div className="product-management-header">
          <div>
            <h2 className="product-management-title">Security policy</h2>
            <p className="product-management-subtitle">
              Global password, session, lockout, 2FA, and API key defaults for staff accounts.
            </p>
          </div>
        </div>
      </div>

      {(submitError || loadError) && (
        <div className="admin-alert admin-alert-error">{submitError || loadError}</div>
      )}

      <AccountSuccessModal
        message={successMessage || ''}
        onClose={() => setSuccessMessage(null)}
      />

      {loading ? (
        <div className="product-management-loading">
          <div
            className="admin-spinner"
            style={{ width: '2.5rem', height: '2.5rem', borderTopColor: '#2563eb', borderWidth: '4px' }}
          />
        </div>
      ) : (
        <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
          <form onSubmit={handleSubmit} className="product-management-form">
            <h3 className="product-management-form-title security-policy-section-title">Passwords</h3>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="passwordMinLength">
                Minimum length
              </label>
              <input
                id="passwordMinLength"
                type="number"
                name="passwordMinLength"
                value={form.passwordMinLength}
                onChange={handleNumberChange}
                min={6}
                max={128}
                required
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group product-management-form-field-full">
              <span className="admin-form-label">Requirements</span>
              <div className="manage-permission-grid">
                <label className="manage-checkbox-label">
                  <input
                    type="checkbox"
                    name="passwordRequireUppercase"
                    checked={form.passwordRequireUppercase}
                    onChange={handleCheckboxChange}
                  />
                  <span className="manage-checkbox-text">Require uppercase</span>
                </label>
                <label className="manage-checkbox-label">
                  <input
                    type="checkbox"
                    name="passwordRequireNumber"
                    checked={form.passwordRequireNumber}
                    onChange={handleCheckboxChange}
                  />
                  <span className="manage-checkbox-text">Require number</span>
                </label>
                <label className="manage-checkbox-label">
                  <input
                    type="checkbox"
                    name="passwordRequireSpecial"
                    checked={form.passwordRequireSpecial}
                    onChange={handleCheckboxChange}
                  />
                  <span className="manage-checkbox-text">Require special character</span>
                </label>
              </div>
            </div>

            <h3 className="product-management-form-title security-policy-section-title">Sessions & lockout</h3>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="sessionTimeoutMinutes">
                Session timeout (minutes)
              </label>
              <input
                id="sessionTimeoutMinutes"
                type="number"
                name="sessionTimeoutMinutes"
                value={form.sessionTimeoutMinutes}
                onChange={handleNumberChange}
                min={15}
                max={10080}
                required
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="maxLoginAttempts">
                Max login attempts
              </label>
              <input
                id="maxLoginAttempts"
                type="number"
                name="maxLoginAttempts"
                value={form.maxLoginAttempts}
                onChange={handleNumberChange}
                min={3}
                max={20}
                required
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="lockoutDurationMinutes">
                Lockout duration (minutes)
              </label>
              <input
                id="lockoutDurationMinutes"
                type="number"
                name="lockoutDurationMinutes"
                value={form.lockoutDurationMinutes}
                onChange={handleNumberChange}
                min={5}
                max={1440}
                required
                className="admin-form-input"
              />
            </div>

            <h3 className="product-management-form-title security-policy-section-title">Two-factor authentication</h3>
            <div className="admin-form-group product-management-form-field-full">
              <div className="manage-permission-grid">
                <label className="manage-checkbox-label">
                  <input
                    type="checkbox"
                    name="requireTwoFactorForAdmins"
                    checked={form.requireTwoFactorForAdmins}
                    onChange={handleCheckboxChange}
                  />
                  <span className="manage-checkbox-text">Require 2FA for admins</span>
                </label>
                <label className="manage-checkbox-label">
                  <input
                    type="checkbox"
                    name="requireTwoFactorForSuperAdmins"
                    checked={form.requireTwoFactorForSuperAdmins}
                    onChange={handleCheckboxChange}
                  />
                  <span className="manage-checkbox-text">Require 2FA for super admins</span>
                </label>
              </div>
            </div>

            <h3 className="product-management-form-title security-policy-section-title">API keys & IP allowlist</h3>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="apiKeyDefaultExpiryDays">
                Default API key expiry (days)
              </label>
              <input
                id="apiKeyDefaultExpiryDays"
                type="number"
                name="apiKeyDefaultExpiryDays"
                value={form.apiKeyDefaultExpiryDays}
                onChange={handleNumberChange}
                min={1}
                max={365}
                required
                className="admin-form-input"
              />
            </div>
            <div className="admin-form-group product-management-form-field-full">
              <label className="admin-form-label" htmlFor="ipAllowlistText">
                IP allowlist
              </label>
              <p className="product-management-subtitle" style={{ marginBottom: '0.5rem' }}>
                One IP or CIDR per line (or comma-separated). Leave empty to allow all.
              </p>
              <textarea
                id="ipAllowlistText"
                name="ipAllowlistText"
                value={form.ipAllowlistText}
                onChange={handleTextChange}
                rows={4}
                placeholder={'203.0.113.10\n198.51.100.0/24'}
                className="admin-form-input security-policy-textarea"
              />
            </div>

            <div className="product-management-form-actions">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                disabled={submitLoading}
                onClick={fetchPolicy}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="admin-btn admin-btn-primary"
              >
                {submitLoading ? 'Saving...' : 'Save security policy'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
