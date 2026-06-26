'use client';

import { useEffect, useState } from 'react';
import { ADMIN_API_BASE, getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import '../../assets/css/manage.css';

const STAFF_BASE = `${ADMIN_API_BASE}/dashboard/super-admin`;

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

export default function Manage() {
    const [admins, setAdmins] = useState([]);
    const [permissionOptions, setPermissionOptions] = useState(DEFAULT_PERMISSIONS);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
  
    const [editTarget, setEditTarget] = useState(null);
    const [editForm, setEditForm] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState(null);
  
    const fetchPermissions = async () => {
      try {
        const res = await fetch(`${STAFF_BASE}/permissions`, { headers: getAdminAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const keys = data?.data ? Object.keys(data.data) : [];
        if (keys.length) setPermissionOptions(keys);
      } catch {
        /* keep defaults */
      }
    };

    const fetchAdmins = async () => {
      setLoading(true);
      setListError(null);
      try {
        const res = await fetch(`${STAFF_BASE}/admins`, { headers: getAdminAuthHeaders() });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || data.error || `Failed to load staff (${res.status})`);
        }
        const data = await res.json();
        setAdmins(Array.isArray(data?.data) ? data.data : []);
      } catch (err) {
        setListError(err.message || 'Failed to load staff accounts');
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchPermissions();
      fetchAdmins();
    }, []);