'use client';
import { useState, useEffect } from 'react';
import '../../../assets/css/orderStatus.css';
import '../../../assets/css/admin.css';

const BASE_URL = 'http://localhost:5000';

export default function OrderDetailView({ selectedOrderId, setSelectedOrderId, onClose, onOrderUpdated }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [canceling, setCanceling] = useState(false);
    const [success, setSuccess] = useState(null);

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

    const handleCancelOrder = async () => {
        if (!order || !selectedOrderId) return;
        
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }
        
        try {
            setCanceling(true);
            setError(null);
            setSuccess(null);
            
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await fetch(`${BASE_URL}/orders/${selectedOrderId}/cancel`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to cancel order');
            }
            
            setSuccess('Order cancelled successfully!');
            // Refresh order details
            await fetchOrderDetails(selectedOrderId);
            
            // Call callback to refresh order list if provided
            if (onOrderUpdated) {
                onOrderUpdated();
            }
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error canceling order:', err);
            setError(err.message);
        } finally {
            setCanceling(false);
        }
    };

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!order) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="orders-empty">
          <p>No order selected. Please select an order from the list.</p>
          <button
            onClick={onClose || (() => setSelectedOrderId(null))}
            className="admin-btn admin-btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <h2 className="dashboard-title">Order Details</h2>
          <p className="dashboard-subtitle">Order ID: {order._id?.toString() || 'N/A'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              onClick={handleCancelOrder}
              disabled={canceling}
              className="admin-btn"
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                opacity: canceling ? 0.6 : 1,
                cursor: canceling ? 'not-allowed' : 'pointer'
              }}
            >
              {canceling ? 'Canceling...' : 'Cancel Order'}
            </button>
          )}
          <button
            onClick={onClose || (() => setSelectedOrderId(null))}
            className="admin-btn admin-btn-secondary"
          >
            Close
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-success-message">
          {success}
        </div>
      )}

      <div className="orders-wrapper section-spacing" style={{ marginTop: 0 }}>
        <div className="section-padding" style={{ padding: 0 }}>
          {/* Order Summary */}
          <div className="order-info-grid" style={{ marginBottom: '2rem' }}>
            <div>
              <h3 className="info-label">Order Status</h3>
              <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                {order.status?.toUpperCase() || 'N/A'}
              </span>
            </div>

            <div>
              <h3 className="info-label">Order Date</h3>
              <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div>
              <h3 className="info-label">Total Amount</h3>
              <p className="info-total">{formatCurrency(order.totalPrice || 0)}</p>
            </div>

            <div>
              <h3 className="info-label">Order Type</h3>
              <p style={{ fontSize: '1rem', fontWeight: '500' }}>
                {order.isGuestOrder ? (
                  <span style={{ color: '#6b7280' }}>Guest Order</span>
                ) : (
                  <span style={{ color: '#2563eb' }}>Registered Customer</span>
                )}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="customer-box" style={{ marginBottom: '2rem' }}>
            <h3 className="section-title">Customer Information</h3>
            {order.isGuestOrder && order.guestDetails ? (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <p><strong>Name:</strong> {order.guestDetails.name || 'N/A'}</p>
                <p><strong>Email:</strong> {order.guestDetails.email || 'N/A'}</p>
                {order.guestDetails.address && (
                  <p><strong>Address:</strong> {order.guestDetails.address}</p>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <p><strong>Name:</strong> {order.customerId?.name || order.customerId?.username || 'N/A'}</p>
                <p><strong>Email:</strong> {order.customerId?.email || 'N/A'}</p>
                {order.customerId?._id && (
                  <p><strong>Customer ID:</strong> <span className="mono-text">{order.customerId._id.toString()}</span></p>
                )}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 className="section-title" style={{ marginBottom: '1rem' }}>Order Items</h3>
            {order.items && order.items.length > 0 ? (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr className="orders-head-row">
                      <th className="orders-th">Product Name</th>
                      <th className="orders-th">Quantity</th>
                      <th className="orders-th">Unit Price</th>
                      <th className="orders-th">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={index} className="orders-tr">
                        <td className="orders-td">
                          <strong>{item.name || 'Unknown Product'}</strong>
                          {item.productId && (
                            <div className="mono-text" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              ID: {item.productId.toString().substring(0, 8)}...
                            </div>
                          )}
                        </td>
                        <td className="orders-td">{item.quantity || 0}</td>
                        <td className="orders-td">{formatCurrency(item.price || 0)}</td>
                        <td className="orders-td total-price">
                          {formatCurrency((item.price || 0) * (item.quantity || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="orders-tr" style={{ borderTop: '2px solid #e5e7eb' }}>
                      <td className="orders-td" colSpan="3" style={{ textAlign: 'right', fontWeight: '600' }}>
                        Total:
                      </td>
                      <td className="orders-td total-price" style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                        {formatCurrency(order.totalPrice || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="orders-empty">
                <p>No items found in this order.</p>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 className="section-title" style={{ marginBottom: '1rem' }}>Order Summary</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Number of Items:</span>
                <strong>{order.items?.length || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Total Quantity:</span>
                <strong>{order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</strong>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid #e5e7eb',
                marginTop: '0.5rem'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Order Total:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb' }}>
                  {formatCurrency(order.totalPrice || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}