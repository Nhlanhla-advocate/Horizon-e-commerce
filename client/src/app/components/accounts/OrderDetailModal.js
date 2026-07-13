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