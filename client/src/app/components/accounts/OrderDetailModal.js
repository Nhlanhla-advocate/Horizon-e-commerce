'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '@/app/i18n/LocaleProvider';
import { cancelOrder, fetchOrder } from './orderApi';
import{
    canCancelOrder,
    formatOrderDate,
    getItemName,
    getItemPrice,
    getOrderItemCount,
    getOrderTotal,
    getStatusBadgeClass,
    shortOrderId,
} from './orderUtils';
import './accountSuccessModal.css';
import '../../assets/css/orderStatus.css';

export default function OrderDetailModal({ orderId, onClose, onOrderUpdated }) {
  const { formatPrice } = useLocale();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!orderId) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [orderId, onClose]);

  const handleCancel = async () => {
    if (!order || !window.confirm('Cancel this order? This cannot be undone.')) return;
    setCanceling(true);
    setError('');
    try {
      const result = await cancelOrder(order._id);
      setOrder(result.order || { ...order, status: 'cancelled' });
      onOrderUpdated?.();
    } catch (err) {
      setError(err.message || 'Failed to cancel order.');
    } finally {
      setCanceling(false);
    }
  };

  if (!orderId) return null;

   return (
    <div
      className="user-account-order-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      onClick={onClose}
    >
      <div
        className="user-account-order-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="user-account-order-modal-header">
          <div>
            <h2 id="order-detail-title">Order details</h2>
            <p>{shortOrderId(orderId)}</p>
          </div>
          <button
            type="button"
            className="user-account-order-modal-close"
            aria-label="Close order details"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {loading && (
          <div className="user-account-order-modal-loading">Loading order...</div>
        )}

        {error && (
          <div className="user-account-alert user-account-alert--error">{error}</div>
        )}

        {!loading && order && (
          <div className="user-account-order-modal-body">
            <div className="user-account-order-summary">
              <div>
                <span className="user-account-order-label">Status</span>
                <span className={status-badge `${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <span className="user-account-order-label">Placed</span>
                <strong>{formatOrderDate(order.createdAt)}</strong>
              </div>
              <div>
                <span className="user-account-order-label">Total</span>
                <strong className="user-account-order-total">
                  {formatPrice(getOrderTotal(order))}
                </strong>
              </div>
              <div>
                <span className="user-account-order-label">Items</span>
                <strong>{getOrderItemCount(order)}</strong>
              </div>
            </div>

            {order.refundStatus && order.refundStatus !== 'none' && (
              <div className="user-account-order-refund">
                Refund status: <strong>{order.refundStatus}</strong>
              </div>
            )}

<h3 className="user-account-order-items-title">Items</h3>
            <ul className="user-account-order-items">
              {(order.items || []).map((item, index) => {
                const unitPrice = getItemPrice(item);
                const quantity = item.quantity || 0;
                return (
                  <li key={item._id || index} className="user-account-order-item">
                    <div className="user-account-order-item-info">
                      <strong>{getItemName(item)}</strong>
                      <span>Qty {quantity}</span>
                    </div>
                    <div className="user-account-order-item-prices">
                      <span>{formatPrice(unitPrice)} each</span>
                      <strong>{formatPrice(unitPrice * quantity)}</strong>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="user-account-order-modal-footer">
              {canCancelOrder(order.status) && (
                <button
                  type="button"
                  className="user-account-btn user-account-btn--danger"
                  disabled={canceling}
                  onClick={handleCancel}
                >
                  {canceling ? 'Cancelling...' : 'Cancel order'}
                </button>
              )}
              <button
                type="button"
                className="user-account-btn user-account-btn--secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}