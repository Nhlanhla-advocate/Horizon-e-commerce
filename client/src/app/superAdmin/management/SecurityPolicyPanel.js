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
