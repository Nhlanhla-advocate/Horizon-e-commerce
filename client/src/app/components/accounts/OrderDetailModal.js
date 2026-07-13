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

 