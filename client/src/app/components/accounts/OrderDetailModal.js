'use client';

import { useCallback, useEffect, useState  } from "react";
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
import'../../assets/css/orderStatus.css';

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