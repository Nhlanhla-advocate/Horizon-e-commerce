'use client';

import { useState, useEffect } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/ordeList.css';
import Pagination from '../Pagination';

//Backend base URL

const BASE_URL = 'http://localhost:5000';

const ORDER_STATUSES = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delievered' },
    { value: 'cancelled', label: 'Cancelled' }
];

export default function OrderList({ onOrderSelect }) {
    const [orders, setOrders] = useState ([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({});

    //Filters states
    const [filters, setFilters] = useState({
        status: 'all',
        startDate: '',
        endDate: '',
        customerId: '',
        page: 1,
        limit: 20
    });

    //Fetch orders with current filters
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            //Build query parameters
            const queryParams = new URLSearchParams();
            if (filters.status !== 'all') {
                queryParams.append('status', filters.status);
            }
            if (filters.startDate) {
                queryParams.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                queryParams.append('endDate', filters.endDate);
            }
            if (filters.customerId) {
                queryParams.append('customerId', filters.customerId);
            }
            queryParams.append('page', filters.page);
            queryParams.append('limit', filters.limit);

            const response = await fetch(`${BASE_URL}/admin/orders?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch (() => ({}));
                throw new Error(errorData.message || 'Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders || []);
            setPagination(data.pagination || {});
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError (err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect (() => {
        fetchOrders();
    }, [filters.page, filters.status, filters.startDate, filters.endDate, filters.customerId]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 //Reset to first page when filters change
        }));
    };

    const handleClearFilters = () => {
        setFilters ({
            status: 'all',
            startDate: '',
            endDate: '',
            customerId: '',
            page: 1,
            limit: 20
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
    }).format(amount);
 };

 const getStatusBadgeClass = (status) => {
    const statusClasses = {
        pending: 'status-pending',
        processing: 'status-processing',
        shipped: 'status-shipped',
        delivered: 'status-delivered',
        cancelled: 'status-cancelled'
    };

    return statusClasses[status] || 'status-default';
 };

 if (loading && orders.length === 0) {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Order Management</h2>
            </div>

            <div className="dashboard-loading">
                <div className="admin-spinner"></div>
            </div>
        </div>
    );
 }

 return (
    <div className="dashboard-container">
        <div className="dashboard-header">
            <h2 className="dashboard-title">Order Management</h2>
            <p className="dashboard-subtitle">View and manage all orders</p>
        </div>

        {error && (
            <div className="admin-error-message">
                {error}
            </div>
        )}

        {/*Filters*/}
        <div className="order-filters">
            <div className="order-filters-grid">

            </div>
            <label className="filter-label">Status</label>
            <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
                >
                    {ORDER_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
        </div>

        <div>
            <label className="filter-label">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-input"
              />
        </div>

        <div>
            <label className="filter-label">End Date</label>
                <input
                    type="date"
                    value={filters.endDate}
                    min={filters.startDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="filter-input"
                    />
        </div>

        <div>
            <label className="filter-label">Customer ID</label>
            <input
               type="text"
               placeholder="Enter customer ID"
               value={filters.customerId}
               onChange={(e) => handleFilterChange('customerId', e.target.value)}
               className="filter-input filter-mono"
               />
               <p className="filter-help"> Filter by specific customer ID</p>
        </div>

    
    
        <button 
            onClick={handleClearFilters}
            className="admin-btn admin-btn-secondary"
        >
            Clear All Filters
        </button>

        {/*Order Table*/}
    <div className="orders-wrapper">
        {orders.length === 0 ? (
            <div className="orders-empty">
                <p> No orders found matching your filters</p>
            </div>
        ) : (
            <>
                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr className="orders-head-row">
                                <th className="orders-th">Order Id</th>
                                <th className="orders-th">Customer</th>
                                <th className="orders-th">Items</th>
                                <th className="orders-th">Total</th>
                                <th className="orders-th">Status</th>
                                <th className="orders-th">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr 
                                    key={order._id} 
                                    className="orders-tr"
                                    onClick={() => onOrderSelect && onOrderSelect(order._id)}
                                    style={{ cursor: onOrderSelect ? 'pointer' : 'default' }}
                                >
                                    <td className="orders-td">
                                        <span className="mono-text">
                                            {order._id.toString().substring(0, 8)}...
                                        </span>
                                    </td>
                                    <td className="orders-td">
                                        <div>
                                            {order.customer?.name || order.customer?.username || 'Guest'}
                                            {order.customer?.isGuest && (
                                                <span className="guest-badge">(Guest)</span>)}
                                        </div>
                                        <div className="customer-email">
                                            {order.customer?.email || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="orders-td">
                                        {order.items?.length || 0} item(s)
                                    </td>
                                    <td className="orders-td total-price">
                                        {formatCurrency(order.totalPrice)}
                                    </td>
                                    <td className="orders-td">
                                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="orders-td mono-text">
                                        {formatDate(order.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>    

                {pagination.totalPages > 1 && (
                    <div className="orders-pagination">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={(page) => handleFilterChange('page', page)}
                        />
                    </div>
                )}        
            </>
        )}
    </div>

    {pagination.totalOrders !== undefined && (
        <div className="orders-summary">
        showing {orders.length} of {pagination.totalOrders} orders
        </div>
    )}
    </div>
   );
};