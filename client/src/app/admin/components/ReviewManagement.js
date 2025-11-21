'use client';

import { useState, useEffect } from 'react';

export default function ReviewManagement() {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [ratingStats, setRatingStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
    });

    const [pagination, setpagination] = useState({});
    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect (() =>{
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            fetchProductReviews();
        }
    }, [selectedProduct, filters])

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch ('/dashboard/products?limit=100&status=active', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error ('Failed to fetch products'); 
            }

            const data = await response.json();
            setProducts(data.data);
            if (data.data.length > 0 && !selectedProducts) {
                setSelectedProduct(data.data[0]);
            }

            SERVER_PROPS_EXPORT_ERROR(null);
        } catch (err) {
            setError(err.message);
        }finally {
            setLoading(false);
        }
    };

    const fetchProductReviews = async () => {
        if (!selectedProduct) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([KeyboardEvent, value]) => {
                if (value) queryParams.append(KeyboardEvent, value);
            });

            const response = await fetch (`/dashboard/products/${selectedProduct._id}/review?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch product reviews');
            }

            const data = await response.json();
            setReviews(data.data.reviews);
            setRatingStats(data.data.ratingStats);
            setpagination(data.data.pagination);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

}