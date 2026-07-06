'use client';

import { useEffect, useMemo, useState } from 'react';
import { ADMIN_API_BASE, getAdminAuthHeaders } from '@/app/utils/adminAccountApi';
import AccountSuccessModal from '@/app/components/accounts/AccountSuccessModal';
import '../../assets/css/admin.css';
import '../../assets/css/productManagement.css';
import '../../assets/css/manage.css';

const STAFF_BASE = `${ADMIN_API_BASE}/dashboard/super-admin`;

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'support', label: 'Support' },
];

const NOTIFICATION_OPTIONS = [
  { key: 'orderAlerts', label: 'Order Alerts' },
  { key: 'stockAlerts', label: 'Stock Alerts' },
  { key: 'reviewAlerts', label: 'Review Alerts' },
  { key: 'securityAlerts', label: 'Security Alerts' },
  { key: 'weeklyReports', label: 'Weekly Reports' },
];

const EMPTY_NOTIFICATIONS = Object.fromEntries(
  NOTIFICATION_OPTIONS.map(({ key }) => [key, false])
);

const readNotificationPreferences = (admin) => ({
  ...EMPTY_NOTIFICATIONS,
  ...(admin?.notificationPreferences || {}),
});

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
  notificationPreferences: { ...EMPTY_NOTIFICATIONS },
};

const btnCompact = { padding: '0.25rem 0.75rem', fontSize: '0.875rem' };

export default function Manage() {
  const [admins, setAdmins] = useState([]);
  const [permissionOptions, setPermissionOptions] = useState(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchInput, setSearchInput] = useState('');

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

  const filteredAdmins = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query) return admins;
    return admins.filter((admin) =>
      admin.email?.toLowerCase().includes(query) ||
      admin.username?.toLowerCase().includes(query) ||
      admin.role?.toLowerCase().includes(query) ||
      admin.status?.toLowerCase().includes(query)
    );
  }, [admins, searchInput]);

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

  const handleNotificationToggle = (key, target = 'create') => {
    if (target === 'create') {
      setForm((prev) => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [key]: !prev.notificationPreferences[key],
        },
      }));
    } else if (editForm) {
      setEditForm((prev) => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [key]: !prev.notificationPreferences[key],
        },
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
        body: JSON.stringify({
          email: form.email.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
          permissions: form.permissions.length ? form.permissions : undefined,
          notificationPreferences: form.notificationPreferences,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || `Request failed (${res.status})`);
      }
      setSuccessMessage('Staff account created successfully.');
      setForm(EMPTY_FORM);
      fetchAdmins();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create staff account');
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
      notificationPreferences: readNotificationPreferences(admin),
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
    <div className="product-management-container">
      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <div className="product-management-header">
          <div>
            <h2 className="product-management-title">Staff account management</h2>
            <p className="product-management-subtitle">
              Create and manage admin, manager, and support accounts.
            </p>
          </div>
        </div>
      </div>

      {(submitError || listError) && (
        <div className="admin-alert admin-alert-error">{submitError || listError}</div>
      )}

      <AccountSuccessModal
        message={successMessage || ''}
        onClose={() => setSuccessMessage(null)}
      />

      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <h2 className="product-management-title" style={{ marginBottom: '1rem' }}>
          Create staff account
        </h2>
        <form onSubmit={handleSubmit} className="product-management-form">
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="staff-email">
              Email <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="staff-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              className="admin-form-input"
              autoComplete="email"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="staff-username">
              Username <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="staff-username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="admin_user"
              required
              className="admin-form-input"
              autoComplete="username"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="staff-password">
              Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="staff-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="admin-form-input"
              autoComplete="new-password"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="staff-role">Role</label>
            <select
              id="staff-role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="admin-form-input"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-group product-management-form-field-full">
            <label className="admin-form-label">Notifications</label>
            <p className="product-management-subtitle" style={{ marginBottom: '0.5rem' }}>
              Choose which alerts this staff member receives.
            </p>
            <div className="manage-permission-grid">
              {NOTIFICATION_OPTIONS.map(({ key, label }) => (
                <label key={key} className="manage-checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(form.notificationPreferences[key])}
                    onChange={() => handleNotificationToggle(key, 'create')}
                  />
                  <span className="manage-checkbox-text">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="admin-form-group product-management-form-field-full">
            <label className="admin-form-label">Permissions (optional)</label>
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
          <div className="product-management-form-actions">
            <button
              type="submit"
              disabled={submitLoading}
              className="admin-btn admin-btn-primary"
            >
              {submitLoading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <h2 className="product-management-title">Staff accounts</h2>
        <p className="product-management-subtitle" style={{ marginBottom: 0 }}>
          View and manage all staff accounts.
        </p>
        <div className="product-management-search-container">
          <div className="product-management-search-wrapper">
            <svg
              className="product-management-search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="product-management-search-input"
              placeholder="Search staff by email, username, or role..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                type="button"
                className="product-management-search-clear"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="product-management-loading">
          <div
            className="admin-spinner"
            style={{ width: '2.5rem', height: '2.5rem', borderTopColor: '#2563eb', borderWidth: '4px' }}
          />
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="admin-card product-management-empty" style={{ borderStyle: 'dashed' }}>
          <p className="product-management-empty-text">
            {admins.length === 0
              ? 'No staff accounts yet.'
              : 'No staff accounts match your search.'}
          </p>
        </div>
      ) : (
        <div className="product-management-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th className="product-management-table-cell-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td className="product-management-table-cell-primary">{admin.email}</td>
                  <td className="product-management-table-cell-primary">{admin.username}</td>
                  <td className="product-management-table-cell-secondary">{admin.role || '—'}</td>
                  <td className="product-management-table-cell-secondary">{admin.status || 'active'}</td>
                  <td className="product-management-table-cell-right">
                    {canManage(admin) ? (
                      <div className="product-management-actions">
                        <button
                          type="button"
                          onClick={() => openEdit(admin)}
                          className="admin-btn admin-btn-secondary"
                          style={btnCompact}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === admin._id}
                          onClick={() => {
                            if (window.confirm(`Delete ${admin.email}?`)) {
                              runStaffAction(admin._id, 'delete');
                            }
                          }}
                          className="admin-btn admin-btn-danger"
                          style={btnCompact}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span className="product-management-table-cell-secondary">Protected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editTarget && editForm && (
        <div className="admin-modal-overlay" onClick={closeEdit}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '42rem', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ padding: '1.5rem' }}>
              <div className="product-management-form-header" style={{ marginBottom: '1rem' }}>
                <h3 className="product-management-form-title">Edit staff account</h3>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="product-management-form-close"
                  style={{ fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer' }}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <p className="product-management-subtitle" style={{ marginBottom: '1rem' }}>
                {editTarget.email}
              </p>
              <form onSubmit={handleEditSave} className="product-management-form">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="edit-username">Username</label>
                  <input
                    id="edit-username"
                    className="admin-form-input"
                    value={editForm.username}
                    onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="edit-email">Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    className="admin-form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="edit-role">Role</label>
                  <select
                    id="edit-role"
                    className="admin-form-input"
                    value={editForm.role}
                    onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    className="admin-form-input"
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="admin-form-group product-management-form-field-full">
                  <label className="admin-form-label">Notifications</label>
                  <p className="product-management-subtitle" style={{ marginBottom: '0.5rem' }}>
                    Choose which alerts this staff member receives.
                  </p>
                  <div className="manage-permission-grid">
                    {NOTIFICATION_OPTIONS.map(({ key, label }) => (
                      <label key={key} className="manage-checkbox-label">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.notificationPreferences[key])}
                          onChange={() => handleNotificationToggle(key, 'edit')}
                        />
                        <span className="manage-checkbox-text">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="admin-form-group product-management-form-field-full">
                  <label className="admin-form-label">Permissions</label>
                  <div className="manage-permission-grid">
                    {permissionOptions.map((perm) => (
                      <label key={perm} className="manage-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.includes(perm)}
                          onChange={() => handlePermissionToggle(perm, 'edit')}
                        />
                        <span className="manage-checkbox-text">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="product-management-form-actions">
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={closeEdit}>
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn admin-btn-primary" disabled={editLoading}>
                    {editLoading ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
