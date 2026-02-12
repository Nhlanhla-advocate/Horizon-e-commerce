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
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
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
            </div>
        </div>
    );
}