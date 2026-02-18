'use client';

import { useState, useEffect, useCallback } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/userManagement.css';

const getBaseUrl = () => (
    typeof window !== 'undefined' ? '' : 'http://localhost:5000');

    export default function ViewAllUsers() {
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [searchTerm, setSearchTerm] = useState('');
        const [roleFilter, setRoleFilter] = useState('');
        const [statusFilter, setStatusFilter] = useState('');

        const fetchUsers = useCallback(async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
                if (!token) {
                    setError('Please sign in to view users.');
                    setLoading(false);
                    return;
                }

                const params = new URLSearchParams();
                if (searchTerm.trim()) params.set('search', searchTerm.trim());
                if (roleFilter)params.set('role',roleFilter);
                if (statusFilter)params.set('status',statusFilter);
                const url = `${getBaseUrl()}/dashboard/users${params.toString() ? `?${params.toString()}` : ''}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.error || data.message || `Failed to fetch users (${response.status})`);
                }
                if (data.success && Array.isArray(data.data)) {
                    setUsers(data.data);
                } else {
                    setUsers([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch users');
                setUsers([]);
            } finally {
                setLoading(false);
            }
        }, [searchTerm, roleFilter, statusFilter]);

        useEffect(() => {
            const t = setTimeout(fetchUsers, 300);
            return () => clearTimeout(t);
          }, [fetchUsers]);

          return (
            <div className="product-management-container">
                <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                    <div className="product-management-header">
                    </div>
                    <h2 className="product-management-title">Customer Management</h2>
                    <p className="product-management-subtitle">View all registered users on the site.</p>
                </div>
                <div className="product-management-search-container">
                <div className="product-management-search-wrapper" style={{ marginBottom: '0.75rem' }}>
                    <svg
                        className="product-management-search-icon"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input 
                    type="text"
                    className="product-management-search-input"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                        type="button"
                        className="product-management-search-clear"
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                        >
                            x
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                        <label className="filter-label" style={{ marginRight: '0.5rem' }}>Role</label>
                        <select
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{ minWidth: '120px' }}
                        >
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="filter-label" style={{ marginRight: '0.5rem' }}>Status</label>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ minWidth: '100px' }}
                        >
                            <option value="">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="admin-error-message">{error}</div>
            )}

            {loading && users.length === 0 ? (
                <div className="dashboard-loading">
                    <div className="admin-spinner"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="orders-empty">
                    <p>No users found. Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div className="orders-wrapper">
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr className="orders-head-row">
                                    <th className="orders-th">Username</th>
                                    <th className="orders-th">Email</th>
                                    <th className="orders-th">Role</th>
                                    <th className="orders-th">Status</th>
                                    <th className="orders-th">Registered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} className="orders-tr">
                                        <td className="orders-td">
                                            <strong>{user.username || '—'}</strong>
                                        </td>
                                        <td className="orders-td">{user.email || '—'}</td>
                                        <td className="orders-td">
                                            <span
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '0.25rem',
                                                    fontSize: '0.875rem',
                                                    backgroundColor:
                                                        user.role === 'super_admin'
                                                            ? '#7c3aed'
                                                            : user.role === 'admin'
                                                                ? '#2563eb'
                                                                : '#6b7280',
                                                    color: '#fff',
                                                }}
                                            >
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="orders-td">
                                            <span
                                                style={{
                                                    color: user.status === 'active' ? '#059669' : '#dc2626',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {user.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="orders-td mono-text">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}