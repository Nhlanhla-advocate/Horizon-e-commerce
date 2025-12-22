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
});