'use client';
import { useState, useEffect } from 'react';
import '../../../assets/css/orderStatus.css';
import '../../../assets/css/admin.css';

const BASE_URL = 'http://localhost:5000';

export default function OrderDetailView({ selectedOrderId, setSelectedOrderId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect (() =>{
        if (selectedOrderId) {
            fetchOrderDetails(selectedOrderId);
        } else {
            setOrder(null);
        }
        //eslint-disable-next-line
    }) [selectedOrderId];
}

const fetchOrderDetails = async (orderId) => {
    try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${BASE_URL}/dashboard/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch order details');
        }
    }
}