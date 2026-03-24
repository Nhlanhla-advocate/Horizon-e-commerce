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
        setSuccessMessage(null);
    };

    const handlePermissionToggle = (perm) => {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(perm)
                ? prev.permissions.filter((p) => p !== perm)
                : [...prev.permissions, perm],
        }));
        setSubmitError(null);
        setSuccessMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSuccessMessage(null);
        if (!form.email?.trim() || !form.username?.trim() || !form.password) {
            setSubmitError('Email, username and password are required');
            return;
        }
        setSubmitLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/dashboard/super-admin/admins`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    email: form.email.trim(),
                    username: form.username.trim(),
                    password: form.password,
                    role: form.role,
                    permissions: form.permissions.length ? form.permissions : undefined,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || data.error || `Request failed (${res.status})`);
            }
            if (!data.success) {
                throw new Error(data.message || data.error || 'Create failed');
            }
            setSuccessMessage('Admin created successfully.');
            setForm({ email: '', username: '', password: '', role: 'admin', permissions: [] });
            fetchAdmins();
        } catch (err) {
            setSubmitError(err.message || 'Failed to create admin');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="manage-super-admin">
            <header className="manage-header">
                <h1 className="manage-title">Admin management</h1>
                <p className="manage-subtitle">Create and manage admin accounts (super admin only)</p>
            </header>

            <section className="manage-section">
                <h2 className="manage-section-title">Create admin</h2>
                <form onSubmit={handleSubmit}className="manage-form">
                    <div className="manage-row">
                        <label className="manage-label">
                            Email <span className="manage-required">*
                                </span>
                        </label>
                        <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="admin@example.com"
                        required
                        className="manage-input"
                        autoComplete="email"
                        />
                    </div>
                    <div className="manage-row">
                        <label className="manage-label">
                            Password <span className="manage-required">*</span>
                        </label>
                        <input
                        type="password"
                        name="password"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        className="manage-input"
                        autoComplete="username"
                        />
                    </div>
                    <div className="manage-row">
                        <label className="manage-label">
                            Password <span className="manage-required">*</span>
                        </label>
                        <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required 
                        className="manage-input"
                        autoComplete="new-password"
                        />
                    </div>
                    <div className="manage-row">
                        <label className="manage-label">Role</label>
                        <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="manage-select"
                        >
                            {ROLES.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                        </select>
                   </div>
                <div className="manage-row">
                    <label className="manage-label">Permissions (optional)</label>
                    <div className="manage-permission-grid">
                        {PERMISSION_OPTIONS.map((perm) => (
                            <label key={perm} className="manage-checkbox-label">
                                <input
                                type="checkbox"
                                checked=
                                {form.permissions.includes(perm)}
                                onChange={() => handlePermissionToggle(perm)}
                                />
                                <span className="manage-checkbox-text">{perm}</span>
                            </label>
                        ))}
                    </div>
                </div>
                {submitError && (
                    <div className="manage-message-error">{submitError}</div>
                )}
                {successMessage && (
                    <div className="manage-message-success">{successMessage}</div>
                )}
                <button
                    type="submit"
                    disabled={submitLoading}
                    className={`manage-button${submitLoading ? ' manage-button--disabled' : ''}`}
                >
                    {submitLoading ? 'Creating...' : 'Create Admin'}
                </button>
                </form>
            </section>

            <section className="manage-section">
                <h2 className="manage-section-title">Existing admins</h2>
                {loading ? (
                    <p className="manage-muted">Loading admins...</p>
                ) : listError ? (
                    <p className="manage-message-error">{listError}</p>
                ) : admins.length === 0 ? (
                    <p className="manage-muted">No admins yet.</p>
                ) : (
                    <div className="manage-table-wrap">
                        <table className="manage-table">
                            <thead>
                                <tr>
                                    <th className="manage-th">Email</th>
                                    <th className="manage-th">Username</th>
                                    <th className="manage-th">Role</th>
                                    <th className="manage-th">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.map((admin) => (
                                    <tr key={admin._id}>
                                        <td className="manage-td">{admin.email}</td>
                                        <td className="manage-td">{admin.username}</td>
                                        <td className="manage-td"><span className="manage-badge">{admin.role || '-'}</span>
                                        </td>
                                        <td className="manager-td">{admin.status || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>  
                )}
            </section>
        </div>
      )
}