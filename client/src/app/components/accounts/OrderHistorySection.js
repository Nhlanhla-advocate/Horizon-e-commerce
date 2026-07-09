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
import OrderDetailsModal from './OrderDetailsModal';
import '../../assets/css/orderStatus.css';

export default function OrderHistorySection({ onError, onSuccess }) {

  const { formatPrice } = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
}