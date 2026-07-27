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