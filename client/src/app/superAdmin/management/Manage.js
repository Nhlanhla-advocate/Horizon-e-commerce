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

   const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editTarget || !editForm) return;
    setEditLoading(true);
    setSubmitError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(`${STAFF_BASE}/admins/${editTarget._id}`, {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(editForm),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Update failed');
      }
      setSuccessMessage('Staff account updated.');
      closeEdit();
      fetchAdmins();
    } catch (err) {
      setSubmitError(err.message || 'Failed to update staff account');
    } finally {
      setEditLoading(false);
    }
  };

  const runStaffAction = async (adminId, action) => {
    setActionLoadingId(adminId);
    setSubmitError(null);
    setSuccessMessage(null);
    const paths = {
      suspend: `${STAFF_BASE}/admins/${adminId}/suspend`,
      activate: `${STAFF_BASE}/admins/${adminId}/activate`,
      delete: `${STAFF_BASE}/admins/${adminId}`,
    };
    try {
      const options = {
        headers: getAdminAuthHeaders(),
        method: action === 'delete' ? 'DELETE' : 'POST',
      };
      if (action === 'suspend') {
        options.body = JSON.stringify({ reason: 'Suspended by super admin' });
      }
      const res = await fetch(paths[action], options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || 'Action failed');
      }
      setSuccessMessage(
        action === 'delete' ? 'Staff account deleted.' :
        action === 'suspend' ? 'Staff account suspended.' :
        'Staff account activated.'
      );
      fetchAdmins();
    } catch (err) {
      setSubmitError(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const canManage = (admin) => admin.role !== 'super_admin';

  return (
      <div className="manage-super-admin">
        <header className="manage-header">
          <h1 className="manage-title">Staff account management</h1>
          <p className="manage-subtitle">Create and manage admin, manager, and support accounts</p>
        </header>
  
        {(submitError || listError) && (
          <div className="manage-message-error">{submitError || listError}</div>
        )}
        {successMessage && <div className="manage-message-success">{successMessage}</div>}
  
        <section className="manage-section">
          <h2 className="manage-section-title">Create staff account</h2>
          <form onSubmit={handleSubmit} className="manage-form">
            <div className="manage-row">
              <label className="manage-label">
                Email <span className="manage-required">*</span>
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
                Username <span className="manage-required">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="admin_user"
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
              <select name="role" value={form.role} onChange={handleChange} className="manage-select">
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="manage-row">
              <label className="manage-label">Permissions (optional)</label>
              <div className="manage-permission-grid">
                {permissionOptions.map((perm) => (
                  <label key={perm} className="manage-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm)}
                      onChange={() => handlePermissionToggle(perm, 'create')}
                    />
                    <span className="manage-checkbox-text">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitLoading}
              className={`manage-button${submitLoading ? ' manage-button--disabled' : ''}`}
            >
              {submitLoading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        </section>

        <section className="manage-section">
        <h2 className="manage-section-title">Staff accounts</h2>
        {loading ? (
          <p className="manage-muted">Loading accounts...</p>
        ) : admins.length === 0 ? (
          <p className="manage-muted">No staff accounts yet.</p>
        ) : (
          <div className="manage-table-wrap">
            <table className="manage-table">
              <thead>
                <tr>
                  <th className="manage-th">Email</th>
                  <th className="manage-th">Username</th>
                  <th className="manage-th">Role</th>
                  <th className="manage-th">Status</th>
                  <th className="manage-th">Source</th>
                  <th className="manage-th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin._id}>
                    <td className="manage-td">{admin.email}</td>
                    <td className="manage-td">{admin.username}</td>
                    <td className="manage-td">
                      <span className="manage-badge">{admin.role || '—'}</span>
                    </td>
                    <td className="manage-td">
                      <span className={`manage-status manage-status--${admin.status || 'active'}`}>
                        {admin.status || 'active'}
                      </span>
                    </td>
                    <td className="manage-td">{admin.accountSource || '—'}</td>
                    <td className="manage-td manage-td-actions">
                      {canManage(admin) ? (
                        <div className="manage-action-group">
                          <button
                            type="button"
                            className="manage-action-btn"
                            onClick={() => openEdit(admin)}
                          >
                            Edit
                          </button>
                          {admin.status === 'active' ? (
                            <button
                              type="button"
                              className="manage-action-btn manage-action-btn--warn"
                              disabled={actionLoadingId === admin._id}
                              onClick={() => runStaffAction(admin._id, 'suspend')}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="manage-action-btn"
                              disabled={actionLoadingId === admin._id}
                              onClick={() => runStaffAction(admin._id, 'activate')}
                            >
                              Activate
                            </button>
                          )}
                          <button
                            type="button"
                            className="manage-action-btn manage-action-btn--danger"
                            disabled={actionLoadingId === admin._id}
                            onClick={() => {
                              if (window.confirm(`Delete ${admin.email}?`)) {
                                runStaffAction(admin._id, 'delete');
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="manage-muted">Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}