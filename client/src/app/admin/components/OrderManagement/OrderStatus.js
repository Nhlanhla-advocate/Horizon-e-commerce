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