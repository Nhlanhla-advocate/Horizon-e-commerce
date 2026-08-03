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