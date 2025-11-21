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

    

}