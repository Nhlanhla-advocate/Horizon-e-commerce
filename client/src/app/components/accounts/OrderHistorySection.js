'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/app/i18n/LocaleProvider';
import { fetchOrderHistory } from './orderApi';
import {
  formatOrderDate,
  getItemName,
  getOrderItemCount,
  getOrderTotal,
  getStatusBadgeClass,
  shortOrderId,
} from './orderUtils';
import OrderDetailModal from './OrderDetailModal';
import OrderItemImage from './OrderItemImage';
import '../../assets/css/orderStatus.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrderHistorySection({
  onError,
  onSuccess,
  title = 'Order history',
  subtitle = 'A log of everything you have purchased, including cancelled orders.',
  showBackLink = false,
  highlightOrderId = '',
}) {
  const { formatPrice } = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    onError?.('');
    try {
      const data = await fetchOrderHistory();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      onError?.(err.message || 'Failed to load your orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!highlightOrderId) return;
    setStatusFilter('all');
    setSelectedOrderId(highlightOrderId);
  }, [highlightOrderId]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter(
      (order) => String(order.status || '').toLowerCase() === statusFilter
    );
  }, [orders, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    STATUS_FILTERS.forEach(({ value }) => {
      if (value === 'all') return;
      counts[value] = orders.filter(
        (order) => String(order.status || '').toLowerCase() === value
      ).length;
    });
    return counts;
  }, [orders]);

  const handleOrderUpdated = () => {
    loadOrders();
    onSuccess?.('Order updated.');
  };

  return (
    <section className="user-account-card user-account-orders">
      <div className="user-account-orders-head">
        <div>
          {showBackLink && (
            <Link href="/account" className="user-account-orders-back">
              ← Back to account
            </Link>
          )}
          <h2>{title}</h2>
          <p className="user-account-field-hint">{subtitle}</p>
        </div>
        <button
          type="button"
          className="user-account-btn user-account-btn--secondary"
          disabled={loading}
          onClick={loadOrders}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="user-account-order-filters" role="tablist" aria-label="Filter orders by status">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={statusFilter === value}
            className={`user-account-order-filter${statusFilter === value ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(value)}
          >
            {label}
            <span className="user-account-order-filter-count">{statusCounts[value] || 0}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="user-account-order-loading">Loading your orders...</div>
      )}

      {!loading && orders.length === 0 && (
        <div className="user-account-order-empty">
          <p>You have not placed any orders yet.</p>
          <Link href="/" className="user-account-btn user-account-btn--primary">
            Start shopping
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && filteredOrders.length === 0 && (
        <div className="user-account-order-empty">
          <p>No {statusFilter} orders found.</p>
          <button
            type="button"
            className="user-account-btn user-account-btn--secondary"
            onClick={() => setStatusFilter('all')}
          >
            Show all orders
          </button>
        </div>
      )}

      {!loading && filteredOrders.length > 0 && (
        <ul className="user-account-order-list">
          {filteredOrders.map((order) => {
            const isHighlighted = String(order._id) === String(highlightOrderId);
            const items = Array.isArray(order.items) ? order.items : [];
            return (
            <li
              key={order._id}
              className={`user-account-order-row${isHighlighted ? ' is-highlighted' : ''}`}
            >
              <div className="user-account-order-row-main">
                <div className="user-account-order-row-top">
                  <strong>{shortOrderId(order._id)}</strong>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  {order.paymentStatus && (
                    <span className={`status-badge status-${order.paymentStatus}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                    </span>
                  )}
                </div>
                <p className="user-account-order-meta">
                  {formatOrderDate(order.createdAt)}
                  {' · '}
                  {getOrderItemCount(order)} item{getOrderItemCount(order) === 1 ? '' : 's'}
                </p>
                {items.length > 0 && (
                  <ul className="user-account-order-preview-items">
                    {items.map((item, index) => (
                        <li key={item._id || `${order._id}-${index}`} className="user-account-order-preview-item">
                          <OrderItemImage item={item} className="user-account-order-preview-image" />
                          <span className="user-account-order-preview-name">{getItemName(item)}</span>
                          <span className="user-account-order-preview-qty">×{item.quantity || 0}</span>
                          <span className="user-account-order-preview-price">
                            {formatPrice(Number(item.price || 0) * Number(item.quantity || 0))}
                          </span>
                        </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="user-account-order-row-side">
                <strong className="user-account-order-row-total">
                  {formatPrice(getOrderTotal(order))}
                </strong>
                <button
                  type="button"
                  className="user-account-btn user-account-btn--secondary"
                  onClick={() => setSelectedOrderId(order._id)}
                >
                  View details
                </button>
              </div>
            </li>
            );
          })}
        </ul>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </section>
  );
}
