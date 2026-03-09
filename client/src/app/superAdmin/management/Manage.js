'use client';

import { useState, useEffect } from 'react';
import '../../assets/css/superAdmin.css';
import '../../assets/css/manage.css';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'support', label: 'Support' },
];

const PERMISSION_OPTIONS = [
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

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined'
        ? (localStorage.getItem('adminToken') || localStorage.getItem('token'))
        : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export default function Manage() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        role: 'admin',
        permissions: [],
    });

    const fetchAdmins = async () => {
        setLoading(true);
        setListError(null);
        try {
            const res = await fetch(`${BASE_URL}/dashboard/super-admin/admins`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || data.error || `Failed to load admins (${res.status})`);
            }
            const data = await res.json();
            setAdmins(Array.isArray(data?.data) ? data.data : []);
        } catch (err) {
            setListError(err.message || 'Failed to load admins');
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setSubmitError(null);
        setSubmitSuccess(null);
    };

    const handlePermissionToggle = (perm) => {
        setForm((prev) => ({
          ...prev,
          permissions: prev.permissions.includes(perm)
            ? prev.permissions.filter((p) => p !== perm)
            : [...prev.permissions, perm],
        }));
        setSubmitError(null);
        setSubmitSuccess(null);
      };
}