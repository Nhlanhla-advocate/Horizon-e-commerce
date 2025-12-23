'use client';

import { useState } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/ordeList.css';
import '../../../assets/css/orderStatus.css';
import OrderList from './OrderList';
import OrderStatus from './OrderStatus';

export default function OrderManagement() {
    const [activeSubTab, setActiveSubTab] = useState('list');
    const [selectwdOrderId, setSelectedOrderId] = useState(null);

    const subTabs = [
        {
            id: 'list',
            label: 'Oder List',
            component: OrderList
        },

        {
            id: 'detail',
            label: 'Order Detail',
            component: OrderDetailView
        },

        {
            id: 'status',
            label: 'Update Status',
            component: OrderStatus
        }
    ];
   
}

