'use client';

import { useState, useEffect } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/orderList.css';

const BASE_URL = 'http://localhost:5000';

const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { Value: 'cancelled', label: 'Cancelled' }
];
export default function OrderStatus ({ selectedOrderId, setSelectedOrderId}) {
    const [orderId, setOrderId] = useState(selectedOrderId || '');
    const [newStatus, setNewStatus] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
}

useEffect (() => {
    if (selectedOrderId) {
        setOrderId(selectedOrderId);
        fetchOrderDetails(selectedOrderId);
    }

    //eslint-disable-next-line 
}, [selectedOrderId]);

const fetchOrderDetails = async (id) => {
    if (!id) return;

    try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${BASE_URL}/dashboard/orders/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.jaon() .catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch order details');
        }

        const data = await response.json();
        const orderData = data.data || data;
        setOrder(orderData);
        setNewStatus(orderData.status || '');
    } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

const handleOrderIdChange = (e) => {
    const id = e.target.value.trim();
    setOrderId(id);
    if (id) {
        fetchOrderDetails(id);
    } else {
        setOrder(null);
        setNewStatus('');
    }
};

const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!orderId || !newStatus) {
        setError('Please select an order and choose a status');
        return;
    }

    try {
        setUpdating(true);
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${BASE_URL}/dashboard/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update order status');
        }

        const data = await response.json();
        setSuccess('Order status updated successfully!');
        setOrder(data.data || order);

        //Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
        console.error('Error updating order status:', err);
        setError(err.message);
    } finally {
        setUpdating(false);
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

return(
    <div className="dashboard-container">
        <div className="dashboard-header">
            <h2 className="dashboard-title">Update Order status</h2>
            <p className="dashboard-subtitle">Change the status of an order</p>
        </div>

        {error && (
            <div className="admin-error-message">
                {error}
            </div>
        )}

        {success && (
            <div className="admin-success-message">
                {success}
            </div>
        )}

        {/* Order ID Input */}
        <div className="order-filters" style={{marginBottom: '1.5rem'}}>
            <label className="filter-label">Order ID</label>
            <input
                type="text"
                placeholder="Enter order ID or select from Order List"
                value={orderid}
                onChange={handleOrderChange}
                className="filter-input filter-mono"
                />
                <p className="filter-help">Enter the order ID to update its status</p>
        </div>

        {loading && (
            <div className="dashboard-loading">
                <div className="admin-spinner"
                style={{ width: '2rem', height: '2rem', borderTopColor: '#2563eb' }}
                />
                </div>
        )}

        {order && (
            <>
            {/*Current Order info*/}
            <div className="orders-wrapper" style={{ marginBottom:'1.5rem'}}>
                <div style={{ padding:'1.5rem'}}>
                    <h3 style={{ fontSize:'1rem', fontWeight:'600',marginBottom:'1rem'}}>
                        Current Order Information
                    </h3>
                    <div className="orders-grid">
                        <div>
                            <p className="dashboard-subtitle">Order ID</p>
                            <p className="mono-text">{order._id?.toString()}</p>
                        </div>

                        <div>
                            <p className="dashboard-subtitle">Current Status</p>
                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        <div>
                            <p className="dashboard-subtitle">Total Amount</p>
                            <p style={{ fontWeight:600 }}>
                                {formatCurrency(order.totalPrice)}
                            </p>
                        </div>

                        <div>
                            <p className="dashboard-subtitle">Order Date</p>
                            <p>{formatDate(order.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/*Status Update Form*/}
            <div className="order-filters">
                <h3 style={{ fontSize:'1rem',fontWeight:'600',marginBottom:'1rem'}}>
                    Update Status
                </h3>

                <form onSubmit={handleStatusUpdate}>
                    <div style={{ marginBottom:'1rem'}}>
                        <label className="filter-label">New Status</label>
                        <select 
                            vallue={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="filter-select"
                            required
                            >
                            <option value="">Select a status</option>
                            {ORDER_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                            </select>
                    </div>

                    <button 
                        type="submit"
                        disabled={updating || !newStatus || newStatus === order.status}
                        className="admin-btn admin-btn-primary"
                        style={{
                            opacity:
                            updating || !newStatus || newStatus === order.status ? 0.6 : 1, cursor:
                            updating || !newStatus || newStatus === order.status ? 'not-allowed' : 'pointer'
                        }}
                        >
                            {updating ? (
                                <>
                                <span
                                className="admin-spinner"
                                style={{
                                    width:'0.875rem',
                                    height:'0.875rem',
                                    borderTopColor:'white',
                                    marginRight:'0.5rem'
                                }}
                                />
                                Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </button>

                        {newStatus === order.status && newStatus && (
                            <p className="dashboard-subtitle" style={{ marginTop: '0.5rem' }}>
                                Status is already set to {newStatus}
                            </p>
                        )}
                </form>
            </div>
            </>
        )}

        {!order && !loading && orderId && (
            <div className="orders-empty">
                <p>Order not found. Please check the order ID and try again.</p>
            </div>
        )}

        {!order && !loading && !orderId && (
            <div className="orders-empty">
                <p>
                    Enter an order ID above to update its status, or select an order from the Order List to update its status.
                </p>
            </div>
        )}
    </div>
);

