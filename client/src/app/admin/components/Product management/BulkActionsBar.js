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

const buildUpdateData = () => {
    if (action === 'status') {
        return { status: statusValue };
    }
    if (action === 'featured') {
        return { featured: featuredValue === 'true'};
    }
    if (action === 'price') {
        const price = Number(priceValue);
        if (Number.isNaN(price) || price < 0) {
            throw new Error('Enter a valid price (0 or greater).');
        }
        return { price };
    }
    if (action === 'stock') {
     const stock = Number(stockValue);
        if (!Number.isInteger(stock) || stock < 0) {
        throw new Error('Enter a valid stock quantity (whole number, 0 or greater).');
    }
    return { stock };
};
throw new Error('Unknown bulk action.');
};

const handleApply = async () => {
    if (disabled || selectedCount === 0) return;

    let updateData;
    try {
      updateData = buildUpdateData();
    } catch (err) {
      alert(err.message);
      return;
    }

    const summary = Object.entries(updateData)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ');

    if (
      !window.confirm(
        `Apply bulk update to ${selectedCount} product${selectedCount === 1 ? '' : 's'}?\n\n${summary}`
      )
    ) {
      return;
    }

    await onApply?.(updateData);
  };