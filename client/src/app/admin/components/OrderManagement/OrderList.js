'use client';

import { useState, useEffect } from 'react';
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
        search: '',
        page: 1,
        limit: 20
    });
    
    const [cancelingOrderId, setCancelingOrderId] = useState(null);

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
            if (filters.search) {
                queryParams.append('search', filters.search);
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
    }, [filters.page, filters.status, filters.startDate, filters.endDate, filters.customerId, filters.search]);

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
            search: '',
            page: 1,
            limit: 20
        });
    };
    
    const handleCancelOrder = async (orderId, e) => {
        e.stopPropagation(); // Prevent row click
        
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }
        
        try {
            setCancelingOrderId(orderId);
            setError(null);
            
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await fetch(`${BASE_URL}/orders/${orderId}/cancel`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to cancel order');
            }
            
            // Refresh orders list
            await fetchOrders();
        } catch (err) {
            console.error('Error canceling order:', err);
            setError(err.message);
        } finally {
            setCancelingOrderId(null);
        }
    };
    
    const handleExportOrders = () => {
        try {
            // Prepare CSV data
            const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Items Count', 'Total Price', 'Status', 'Date'];
            const rows = orders.map(order => [
                order._id?.toString() || '',
                order.customer?.name || order.customer?.username || 'Guest',
                order.customer?.email || 'N/A',
                order.items?.length || 0,
                order.totalPrice || 0,
                order.status || '',
                formatDate(order.createdAt)
            ]);
            
            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n');
            
            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Error exporting orders:', err);
            setError('Failed to export orders');
        }
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

        {/*Search and Export Section*/}
        <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem', 
            alignItems: 'flex-start',
            flexWrap: 'wrap'
        }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
                <label className="filter-label">Search Orders</label>
                <input
                    type="text"
                    placeholder="Search by order ID, customer name, email, or product name"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="filter-input"
                    style={{ width: '100%' }}
                />
                <p className="filter-help">Search across order IDs, customer information, and product names</p>
            </div>
            <div style={{ 
                display: 'flex', 
                alignItems: 'flex-end',
                height: 'fit-content',
                marginTop: '1.5rem'
            }}>
                <button 
                    onClick={handleExportOrders}
                    className="admin-btn admin-btn-secondary"
                    disabled={orders.length === 0}
                    style={{ 
                        whiteSpace: 'nowrap',
                        opacity: orders.length === 0 ? 0.6 : 1,
                        cursor: orders.length === 0 ? 'not-allowed' : 'pointer',
                        height: 'fit-content',
                        padding: '0.5rem 1rem'
                    }}
                >
                    Export to CSV
                </button>
            </div>
        </div>

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
                                <th className="orders-th">Actions</th>
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
                                    <td className="orders-td">
                                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                            <button
                                                onClick={(e) => handleCancelOrder(order._id, e)}
                                                disabled={cancelingOrderId === order._id}
                                                className="admin-btn admin-btn-secondary"
                                                style={{
                                                    padding: '0.375rem 0.75rem',
                                                    fontSize: '0.875rem',
                                                    opacity: cancelingOrderId === order._id ? 0.6 : 1,
                                                    cursor: cancelingOrderId === order._id ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {cancelingOrderId === order._id ? 'Canceling...' : 'Cancel'}
                                            </button>
                                        )}
                                        {order.status === 'cancelled' && (
                                            <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>Cancelled</span>
                                        )}
                                        {order.status === 'delivered' && (
                                            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>N/A</span>
                                        )}
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