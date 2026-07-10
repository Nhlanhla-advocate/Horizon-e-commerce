'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '@/app/i18n/LocaleProvider';
import { fetchOrderHistory } from './orderApi';
import {
  formatOrderDate,
  getOrderItemCount,
  getOrderTotal,
  getStatusBadgeClass,
  shortOrderId,
} from './orderUtils';
import OrderDetailModal from './OrderDetailModal';
import '../../assets/css/orderStatus.css';

export default function OrderHistorySection({ onError, onSuccess }) {

  const { formatPrice } = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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

  const handleOrderUpdated = () => {
    loadOrders();
    onSuccess?.('Order updated.');
  };

  return (
    <section className="user-account-card user-account-orders">
      <div className="user-account-orders-head">
        <div>
          <h2>Order history</h2>
          <p className="user-account-field-hint">
            Track your purchases and order status after checkout.
          </p>
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

      {loading && (
        <div className="user-account-order-loading">Loading your orders...</div>
      )}

      {!loading && orders.length === 0 && (
        <div className="user-account-order-empty">
          <p>You have not placed any orders yet.</p>
          <a href="/" className="user-account-btn user-account-btn--primary">
            Start shopping
          </a>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <ul className="user-account-order-list">
          {orders.map((order) => (
            <li key={order._id} className="user-account-order-row">
              <div className="user-account-order-row-main">
                <div className="user-account-order-row-top">
                  <strong>{shortOrderId(order._id)}</strong>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="user-account-order-meta">
                  {formatOrderDate(order.createdAt)}
                  {' · '}
                  {getOrderItemCount(order)} item{getOrderItemCount(order) === 1 ? '' : 's'}
                </p>
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
          ))}
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