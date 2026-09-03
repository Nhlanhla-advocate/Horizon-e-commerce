import { normalizeProductImagePath } from '@/app/utils/productGallery';

const PLACEHOLDER_IMAGE = '/file.svg';

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

  const encodeImageSrc = (src) => {
    if (!src || typeof src !== 'string') return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;

    const pathOnly = src.startsWith('/') ? src : `/${src}`;
    const segments = pathOnly.split('/').filter(Boolean);
    if (segments.length === 0) return '';

    return `/${segments
      .map((seg) => {
        try {
          return encodeURIComponent(decodeURIComponent(seg));
        } catch {
          return encodeURIComponent(seg);
        }
      })
      .join('/')}`;
  };

  const playstationFallbacksByName = (productName) => {
    const normalizedName = String(productName || '').toLowerCase();
    if (!normalizedName) return [];

    if (normalizedName.includes('playstation 4') || normalizedName.includes('ps4')) {
      return [
        '/Pictures/Playstation 4.jpg',
        '/Pictures/Playstation4.jpg',
        '/Pictures/Playstation 4 Slim.jpg',
        '/Pictures/Playstation 4 pro.jpg',
        '/Pictures/Playstation 4 Pro.jpg',
      ];
    }

    if (normalizedName.includes('playstation 5') || normalizedName.includes('ps5')) {
      return [
        '/Pictures/Playstation 5.jpg',
        '/Pictures/Playstation 5 Digital.jpg',
        '/Pictures/Playstation 5 disk.jpg',
        '/Pictures/Playstation 5 pro.jpg',
      ];
    }

    return [];
  };

  export const getItemImageCandidates = (item) => {
    const product = item?.productId && typeof item.productId === 'object' ? item.productId : null;
    const name = getItemName(item);
    const rawCandidates = [];

    if (typeof item?.image === 'string') rawCandidates.push(item.image);
    if (Array.isArray(item?.images)) rawCandidates.push(...item.images);
    if (Array.isArray(product?.images)) rawCandidates.push(...product.images);
    if (typeof product?.image === 'string') rawCandidates.push(product.image);
    if (name && name !== 'Unknown product' && name !== 'Product') {
      rawCandidates.push(name);
      rawCandidates.push(name.replace(/\bnecklace\b/gi, 'necklaces'));
      rawCandidates.push(name.replace(/\bearrings\b/gi, 'earings'));
      rawCandidates.push(name.replace(/\bearings\b/gi, 'earrings'));
    }
    rawCandidates.push(...playstationFallbacksByName(name));

    const normalized = rawCandidates
      .map((value) => encodeImageSrc(normalizeProductImagePath(value) || ''))
      .filter(Boolean);

    const unique = [...new Set(normalized)];
    return unique.length > 0 ? unique : [PLACEHOLDER_IMAGE];
  };

  export const getItemImage = (item) => getItemImageCandidates(item)[0] || PLACEHOLDER_IMAGE;
  
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