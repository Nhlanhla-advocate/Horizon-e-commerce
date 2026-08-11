'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';
import '../../assets/css/admin.css';
import '../../assets/css/productManagement.css';
import '../../assets/css/userManagement.css';

const USERS_URL = '/dashboard/users';
const MODERATION_BASE = '/dashboard/super-admin/users';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
  { value: 'inactive', label: 'Inactive' },
];

const statusColor = (status) => {
  if (status === 'active') return '#059669';
  if (status === 'suspended') return '#d97706';
  if (status === 'banned') return '#dc2626';
  return '#6b7280';
};