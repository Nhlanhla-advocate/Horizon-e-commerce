'use client';
import { useState, useEffect } from 'react';
import '../../../assets/css/orderStatus.css';
import '../../../assets/css/admin.css';

const BASE_URL = 'http://localhost:5000';

export default function OrderDetailView({ selectedOrderId, setSelectedOrderId }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrderDetails = async (orderId) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${BASE_URL}/dashboard/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch order details');
            }

            const data = await response.json();
            setOrder(data.data || data);
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

    const getStatusBadgeClass = (status) =>
        ({
            pending: 'status-pending',
            processing: 'status-processing',
            shipped: 'status-shipped',
            delivered: 'status-delivered',
            cancelled: 'status-cancelled',
        }[status] || 'status-default');

    useEffect(() => {
        if (selectedOrderId) {
            fetchOrderDetails(selectedOrderId);
        } else {
            setOrder(null);
        }
        //eslint-disable-next-line
    }, [selectedOrderId]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="admin-spinner spinner-md" />
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Order Details</h2>
        <button
          onClick={() => setSelectedOrderId(null)}
          className="admin-btn admin-btn-secondary"
        >
          Back to List
        </button>
      </div>

      <div className="orders-wrapper section-spacing">
        <div className="section-padding">
          <div className="order-info-grid">
            <div>
              <h3 className="info-label">Order Status</h3>
              <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div>
              <h3 className="info-label">Total Amount</h3>
              <p className="info-total">{formatCurrency(order.totalPrice)}</p>
            </div>
          </div>

          <div className="customer-box">
            <h3 className="section-title">Customer Information</h3>
            <p><strong>Email:</strong> {order.customerId?.email || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}