'use client';

import { useState } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/ordeList.css';
import '../../../assets/css/orderStatus.css';
import OrderList from './OrderList';
import OrderStatus from './OrderStatus';

export default function OrderManagement() {
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const handleOrderSelect = (orderId) => {
        setSelectedOrderId(orderId);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <OrderList onOrderSelect={handleOrderSelect} />
            <OrderStatus 
                selectedOrderId={selectedOrderId} 
                setSelectedOrderId={setSelectedOrderId} 
            />
        </div>
    );
}

