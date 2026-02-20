'use client';

import { useState, useEffect, useCallback } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/userManagement.css';

const getBaseUrl = () => (
    typeof window !== 'undefined' ? '' : 'http://localhost:5000');

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export default function ViewAllUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [userCart, setUserCart] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [detailTab, setDetailTab] = useState('cart');

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
            if (roleFilter) params.set('role', roleFilter);
            if (statusFilter) params.set('status', statusFilter);
            const url = `${getBaseUrl()}/dashboard/users${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url, {
                headers: getAuthHeaders(),
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

    const fetchUserDetails = useCallback(async (userId) => {
        const base = getBaseUrl();
        setDetailLoading(true);
        setUserCart(null);
        setUserReviews([]);
        setUserOrders([]);
        try {
            const [cartRes, reviewsRes, ordersRes] = await Promise.all([
                fetch(`${base}/dashboard/users/${userId}/cart`, { headers: getAuthHeaders() }),
                fetch(`${base}/dashboard/users/${userId}/reviews`, { headers: getAuthHeaders() }),
                fetch(`${base}/dashboard/users/${userId}/orders`, { headers: getAuthHeaders() }),
            ]);
            const cartData = cartRes.ok ? await cartRes.json() : null;
            const reviewsData = reviewsRes.ok ? await reviewsRes.json() : null;
            const ordersData = ordersRes.ok ? await ordersRes.json() : null;
            if (cartData?.success) setUserCart(cartData.data);
            if (reviewsData?.success && Array.isArray(reviewsData.data)) setUserReviews(reviewsData.data);
            if (ordersData?.success && Array.isArray(ordersData.data)) setUserOrders(ordersData.data);
        } catch (err) {
            console.error('Error fetching user details:', err);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const openUserDetail = (user) => {
        setSelectedUser(user);
        setDetailTab('cart');
        fetchUserDetails(user._id);
    };

    const closeUserDetail = () => {
        setSelectedUser(null);
        setUserCart(null);
        setUserReviews([]);
        setUserOrders([]);
    };

    const cartItems = userCart?.items || [];
    const cartTotal = userCart?.totalPrice ?? 0;
    const getItemName = (item) => item.name || item.productId?.name || item.product?.name || 'Product';
    const getItemPrice = (item) => item.price ?? 0;

    const statusColors = {
        pending: '#f59e0b',
        processing: '#3b82f6',
        shipped: '#8b5cf6',
        delivered: '#059669',
        cancelled: '#dc2626',
    };

    return (
        <div className="product-management-container">
            <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                <div className="product-management-header"></div>
                <h2 className="product-management-title">Customer Management</h2>
                <p className="product-management-subtitle">View all registered users. Click a row to see their cart, reviews, and orders.</p>
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
                                    <tr
                                        key={user._id}
                                        className="orders-tr"
                                        onClick={() => openUserDetail(user)}
                                        style={{ cursor: 'pointer' }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                openUserDetail(user);
                                            }
                                        }}
                                    >
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

            {/* User detail modal */}
            {selectedUser && (
                <div
                    className="admin-modal-overlay"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem',
                    }}
                    onClick={closeUserDetail}
                    role="dialog"
                    aria-modal="true"
                    aria-label="User details"
                >
                    <div
                        className="admin-modal-content"
                        style={{
                            background: '#fff',
                            borderRadius: '0.75rem',
                            maxWidth: '640px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                                    {selectedUser.username || '—'}
                                </h3>
                                <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                                    {selectedUser.email || '—'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeUserDetail}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    padding: '0.25rem',
                                    lineHeight: 1,
                                }}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                            {['cart', 'reviews', 'orders'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setDetailTab(tab)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: detailTab === tab ? '#2563eb' : 'transparent',
                                        color: detailTab === tab ? '#fff' : '#374151',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        textTransform: 'capitalize',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div style={{ padding: '1rem 1.5rem', overflow: 'auto', flex: 1 }}>
                            {detailLoading ? (
                                <div className="dashboard-loading" style={{ padding: '2rem' }}>
                                    <div className="admin-spinner"></div>
                                </div>
                            ) : (
                                <>
                                    {detailTab === 'cart' && (
                                        <div>
                                            {cartItems.length === 0 ? (
                                                <p style={{ color: '#6b7280', margin: 0 }}>Cart is empty.</p>
                                            ) : (
                                                <>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                        {cartItems.map((item, idx) => (
                                                            <li
                                                                key={idx}
                                                                style={{
                                                                    padding: '0.75rem 0',
                                                                    borderBottom: '1px solid #f3f4f6',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                }}
                                                            >
                                                                <span>{getItemName(item)} × {item.quantity}</span>
                                                                <span>R {(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <p style={{ marginTop: '1rem', fontWeight: 600 }}>
                                                        Total: R {typeof cartTotal === 'number' ? cartTotal.toFixed(2) : '0.00'}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {detailTab === 'reviews' && (
                                        <div>
                                            {userReviews.length === 0 ? (
                                                <p style={{ color: '#6b7280', margin: 0 }}>No reviews yet.</p>
                                            ) : (
                                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                    {userReviews.map((rev) => (
                                                        <li
                                                            key={rev._id}
                                                            style={{
                                                                padding: '0.75rem 0',
                                                                borderBottom: '1px solid #f3f4f6',
                                                            }}
                                                        >
                                                            <div style={{ fontWeight: 500 }}>
                                                                {rev.product?.name || 'Product'} — {rev.rating}★
                                                            </div>
                                                            {rev.comment && (
                                                                <p style={{ margin: '0.25rem 0 0', color: '#4b5563', fontSize: '0.875rem' }}>
                                                                    {rev.comment}
                                                                </p>
                                                            )}
                                                            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}

                                    {detailTab === 'orders' && (
                                        <div>
                                            {userOrders.length === 0 ? (
                                                <p style={{ color: '#6b7280', margin: 0 }}>No orders yet.</p>
                                            ) : (
                                                <div className="orders-table-wrapper">
                                                    <table className="orders-table" style={{ fontSize: '0.875rem' }}>
                                                        <thead>
                                                            <tr className="orders-head-row">
                                                                <th className="orders-th">Date</th>
                                                                <th className="orders-th">Total</th>
                                                                <th className="orders-th">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {userOrders.map((order) => (
                                                                <tr key={order._id} className="orders-tr">
                                                                    <td className="orders-td">
                                                                        {order.createdAt
                                                                            ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                            })
                                                                            : '—'}
                                                                    </td>
                                                                    <td className="orders-td">R {(order.totalPrice || 0).toFixed(2)}</td>
                                                                    <td className="orders-td">
                                                                        <span
                                                                            style={{
                                                                                padding: '0.2rem 0.5rem',
                                                                                borderRadius: '0.25rem',
                                                                                fontSize: '0.75rem',
                                                                                fontWeight: 500,
                                                                                backgroundColor: statusColors[order.status] || '#6b7280',
                                                                                color: '#fff',
                                                                            }}
                                                                        >
                                                                            {order.status || 'pending'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
