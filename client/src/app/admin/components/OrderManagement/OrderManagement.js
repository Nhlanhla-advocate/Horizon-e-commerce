'use client';

import { useState } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/ordeList.css';
import '../../../assets/css/orderStatus.css';
import OrderList from './OrderList';
import OrderStatus from './OrderStatus';
import OrderDetailView from './OrderDetailView';

export default function OrderManagement() {
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleOrderSelect = (orderId) => {
        setSelectedOrderId(orderId);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = (orderId) => {
        setSelectedOrderId(orderId);
        setShowStatusModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedOrderId(null);
    };

    const handleCloseStatusModal = () => {
        setShowStatusModal(false);
        setSelectedOrderId(null);
    };

    const handleStatusUpdated = () => {
        // Trigger refresh of order list
        setRefreshKey(prev => prev + 1);
    };

    const handleOrderUpdated = () => {
        // Trigger refresh of order list (e.g., when order is cancelled)
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="dashboard-container">
            {/* Order List - Main View */}
            <OrderList
                key={refreshKey}
                onOrderSelect={handleOrderSelect}
                onUpdateStatus={handleUpdateStatus}
            />

            {/* Order Detail Modal */}
            {showDetailModal && (
                <div
                    className="admin-modal-overlay"
                    onClick={handleCloseDetailModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div
                        className="admin-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            position: 'relative'
                        }}
                    >
                        <OrderDetailView
                            selectedOrderId={selectedOrderId}
                            setSelectedOrderId={handleCloseDetailModal}
                            onClose={handleCloseDetailModal}
                            onOrderUpdated={handleOrderUpdated}
                        />
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showStatusModal && (
                <div
                    className="admin-modal-overlay"
                    onClick={handleCloseStatusModal}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                >
                    <div
                        className="admin-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            position: 'relative'
                        }}
                    >
                        <OrderStatus
                            selectedOrderId={selectedOrderId}
                            setSelectedOrderId={handleCloseStatusModal}
                            onClose={handleCloseStatusModal}
                            onStatusUpdated={handleStatusUpdated}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

