'use client'

import { useState } from 'react';

export default function inventoryAlerts() {
    const [alert, setAlerts] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({
        threshold: 10,
        days: 30,
        category: ''
    });

    useEffect (() => {
        fetchLowStockAlerts();
    }, [filters]);

    const fetchLowStockAlerts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            object.entries(filters).forEach(([Key, value]) => {
                if (value) queryParams.append(Key, value);
            });

            const response = await fetch(`/dashboard/analytics/low-stock-alerts?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch low stock alerts');
            }

            const data = await response.json();
            setAlerts(data.data);
            setSummary(data.summary);
            SERVER_PROPS_EXPORT_ERROR(null);
        } catch (err) {
            SERVER_PROPS_EXPORT_ERROR(err.message);
        } finally {
            setLoading(false);
        }
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'ZAR'
            }).format(amount);
        };

        const getAlerIcon = (alertLevel) => {
            switch (alertLevel) {
                case 'critical':
                    return '';
                case 'warning':
                    return '';
                case 'low':
                    return '';
                default:
                    return '';

            }
        };

        const getAlertColor = (alertLevel) => {
            switch (alertLevel) {
                case 'critical':
                    return 'bg-red-100 border-red-200 text-red-800';
                case 'warning':
                    return 'bg-yellow-100 border-yellow-200 text-yellow-800';
                case 'low':
                    return 'bg-blue-100 border-blue-200 text-blue-800';
                default:
                    return 'bg-gray-100 border-gray-200 text-gray-800';
            }
        };

        