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