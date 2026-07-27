'use client';

import { useCallback, useEffect, useState } from 'react';
import { ADMIN_API_BASE, getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';

const API_KEYS_BASE = ${ADMIN_API_BASE}/dashboard/super-admin/api-keys;

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