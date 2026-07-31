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