'use client';

import { useState } from 'react';

const ACTIONS = [
    { value: 'status', label: 'Status' },
    { value: 'featured', label: 'Featured' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'stock' },
];

export default function BulkActionsBar({
    selectedCount,
    disabled = false,
    onApply,
    onClear,
}) {
    const [action, setAction] = useState('status');
    const [statusValue, setStatusValue] = useState('active');
    const [featuredValue, setFeaturedValue] = useState('true');
    const [priceValue, setPriceValue] = useState('');
    const [stockValue, setStockValue] = useState('');
}