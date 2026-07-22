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

  return (
    <div className="product-bulk-bar" role="region" aria-label="Bulk product actions">
      <span className="product-bulk-bar-count">
        {selectedCount} selected
      </span>

      <div className="product-bulk-bar-controls">
        <label className="product-bulk-bar-field">
          <span className="product-bulk-bar-label">Action</span>
          <select
            className="product-bulk-bar-select"
            value={action}
            disabled={disabled}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {action === 'status' && (
          <label className="product-bulk-bar-field">
            <span className="product-bulk-bar-label">Value</span>
            <select
              className="product-bulk-bar-select"
              value={statusValue}
              disabled={disabled}
              onChange={(e) => setStatusValue(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </label>
        )}

        {action === 'featured' && (
          <label className="product-bulk-bar-field">
            <span className="product-bulk-bar-label">Value</span>
            <select
              className="product-bulk-bar-select"
              value={featuredValue}
              disabled={disabled}
              onChange={(e) => setFeaturedValue(e.target.value)}
            >
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </select>
          </label>
        )}

        {action === 'price' && (
          <label className="product-bulk-bar-field">
            <span className="product-bulk-bar-label">Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="product-bulk-bar-input"
              value={priceValue}
              disabled={disabled}
              placeholder="0.00"
              onChange={(e) => setPriceValue(e.target.value)}
            />
          </label>
        )}

        {action === 'stock' && (
          <label className="product-bulk-bar-field">
            <span className="product-bulk-bar-label">Stock</span>
            <input
              type="number"
              min="0"
              step="1"
              className="product-bulk-bar-input"
              value={stockValue}
              disabled={disabled}
              placeholder="0"
              onChange={(e) => setStockValue(e.target.value)}
            />
          </label>
        )}

      <div className="product-bulk-bar-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={disabled || selectedCount === 0}
            onClick={handleApply}
          >
            Apply
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            disabled={disabled}
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
