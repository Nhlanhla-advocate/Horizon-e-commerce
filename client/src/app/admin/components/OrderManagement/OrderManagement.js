'use client';

import { useState } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/ordeList.css';
import '../../../assets/css/orderStatus.css';
import OrderList from './OrderList';
import OrderStatus from './OrderStatus';
import OrderDetailView from './OrderDetailView';

export default function OrderManagement() {
    const [activeSubTab, setActiveSubTab] = useState('list');
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const subTabs = [
        {
            id: 'list',
            label: 'Order List',
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

    const ActiveSubComponent = subTabs.find(tab => tab.id === activeSubTab)?.component;

    return (
        <div className="dashboard-container">
            {/*Sub-tab Navigation*/}
            <div className="order-subtabs" style={{ 
                display: 'flex',
                gap: '0.5rem',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '0.5rem',
                marginBottom: '1.5rem'
            }}>
                {subTabs.map((tab) => (
                    <button 
                     key={tab.id}
                     onClick={() => setActiveSubTab(tab.id)}
                     className={`admin-btn ${activeSubTab === tab.id ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                     style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.87rem',
                        fontWeight: activeSubTab === tab.id ? '600' : '500',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                     }}
                     >
                        {tab.label}
                     </button>
                ))}
            </div>

            {/* Active Sub-tab content */}
            {ActiveSubComponent && (
                <ActiveSubComponent
                    selectedOrderId={selectedOrderId}
                    setSelectedOrderId={setSelectedOrderId}
                    onOrderSelect={(orderId) => {
                        setSelectedOrderId(orderId);
                        setActiveSubTab('detail');
                    }}
                 />
            )}
        </div>
    );
   
}

