'use client';

import { useState, useEffect } from 'react';
import '../../../assets/css/admin.css';
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

export default function OrderList() {
    const [orders, setOrders] = useState ([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(true);
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

            const response = await fetch(`$(BASE_URL)/admin/orders?$(queryParams)`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        }
    }
}