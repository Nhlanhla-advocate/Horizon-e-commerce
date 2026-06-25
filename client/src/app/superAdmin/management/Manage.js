'use client';

import { useEffect, useState } from 'react';
import { ADMIN_API_BASE, getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import '../../assets/css/manage.css';

const STAFF_BASE = ${ADMIN_API_BASE}/dashboard/super-admin;

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'support', label: 'Support' },
];

const DEFAULT_PERMISSIONS = [
  'manage_products',
  'manage_orders',
  'view_users',
  'manage_users',
  'manage_admins',
  'view_audit_logs',
  'view_system_activity',
  'suspend_ban_users',
  'override_orders',
];

const EMPTY_FORM = {
  email: '',
  username: '',
  password: '',
  role: 'admin',
  permissions: [],
};