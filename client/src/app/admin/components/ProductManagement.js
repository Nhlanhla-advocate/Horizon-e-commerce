'use client';

import { useState, useEffect} from 'react';

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [filters, setFilters] = useState ({
        page: 1,
        limit: 20,
        sort:'createdAt',
        order: 'desc',
        search: '',
        category: '',
        status: '',
        minPrice: '',
        maxPrice: ''
    });

    const [pagination, setPagination] = useState({});

    useEffect(() => {
        fetchProducts();

    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const queryParams = new URLSearchParams ();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch (`/dashboard/products?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data.data);
            setPagination(data.pagination);
            setError(null);
        } catch (err) {
            setError (err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (productData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch ('/dashboard/products', {
                method: 'POST',
                HEADERS: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            } );

            if (!response.ok) {
                throw new Error('Failed to add product');
            }
            setShowAddForm(false);
            fetchProducts();
        } catch (err) {
            setError(err.message);
        }
    };