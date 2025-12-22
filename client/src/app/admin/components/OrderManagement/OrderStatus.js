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
        shepped: 'status-shipped',
        delivered: 'status-delivered',
        cancelled: 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
};


});