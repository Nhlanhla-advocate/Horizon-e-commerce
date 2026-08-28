const STATUS_BADGE_CLASS = {
    pending: 'status-pending',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
  };
  
  export const getStatusBadgeClass = (status) =>
    STATUS_BADGE_CLASS[status] || 'status-default';
  
  export const formatOrderDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  export const getItemName = (item) =>
    item?.name || item?.productId?.name || 'Unknown product';

  export const getItemImage = (item) => {
    if (typeof item?.image === 'string' && item.image.trim()) return item.image.trim();
    const product = item?.productId;
    if (product && typeof product === 'object') {
      if (Array.isArray(product.images) && typeof product.images[0] === 'string') {
        return product.images[0];
      }
      if (typeof product.image === 'string' && product.image.trim()) return product.image.trim();
    }
    return '';
  };
  
  export const getItemPrice = (item) => {
    const price = item?.price ?? item?.productId?.price;
    return Number(price) || 0;
  };
  
  export const getOrderTotal = (order) => {
    if (order?.totalPrice != null) return Number(order.totalPrice) || 0;
    return (order?.items || []).reduce(
      (sum, item) => sum + getItemPrice(item) * (item.quantity || 0),
      0,
    );
  };
  
  export const getOrderItemCount = (order) =>
    (order?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
  
  export const canCancelOrder = (status) =>
    status === 'pending' || status === 'processing';
  
  export const shortOrderId = (orderId) => {
    const id = orderId?.toString() || '';
    return id.length > 8 ? `#${id.slice(-8).toUpperCase()}` : `#${id.toUpperCase()}`;
  };