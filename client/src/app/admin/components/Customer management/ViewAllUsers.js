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

       
        );
    }