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

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setSubmitError(null);
      setSuccessMessage(null);
    };
  
    const handlePermissionToggle = (perm, target = 'create') => {
      if (target === 'create') {
        setForm((prev) => ({
          ...prev,
          permissions: prev.permissions.includes(perm)
            ? prev.permissions.filter((p) => p !== perm)
            : [...prev.permissions, perm],
        }));
      } else if (editForm) {
        setEditForm((prev) => ({
          ...prev,
          permissions: prev.permissions.includes(perm)
            ? prev.permissions.filter((p) => p !== perm)
            : [...prev.permissions, perm],
        }));
      }
      setSubmitError(null);
      setSuccessMessage(null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitError(null);
      setSuccessMessage(null);
      if (!form.email?.trim() || !form.username?.trim() || !form.password) {
        setSubmitError('Email, username and password are required.');
        return;
      }
      setSubmitLoading(true);
      try {
        const res = await fetch(`${STAFF_BASE}/admins`, {
          method: 'POST',
          headers: getAdminAuthHeaders(),
          body:JSON.stringify({
            email: form.email.trim(),
            username: form.username.trim(),
            password: form.password,
            role: form.role,
            permissions: form.permissions.length ? form.permissions : undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          throw new Error(data.message || data.error || `Reques failed (${res.status})` );
        }
        setSuccessMessage('Staff account created successfully.');
      } finally {
        setSubmitLoading(false);
      }
    };

      const openEdit = (admin) => {
    if (admin.role === 'super_admin') return;
    setEditTarget(admin);
    setEditForm({
      username: admin.username || '',
      email: admin.email || '',
      role: admin.role || 'admin',
      status: admin.status || 'active',
      permissions: Array.isArray(admin.permissions) ? [...admin.permissions] : [],
    });
  };

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm(null);
  };