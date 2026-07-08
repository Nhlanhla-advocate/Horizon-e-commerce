const Product = require('../models/product');

/**
 * Resolve unit price for a single cart/order line.
 * Prefer the snapshotted line price; fall back to populated product fields.
 */
const resolveLinePrice = (item = {}) => {
  if (item.price != null && Number.isFinite(Number(item.price))) {
    return Number(item.price);
  }
  if (item.productId && typeof item.productId === 'object' && item.productId.price != null) {
    return Number(item.productId.price) || 0;
  }
  if (item.product && typeof item.product === 'object' && item.product.price != null) {
    return Number(item.product.price) || 0;
  }
  return 0;
};

const resolveLineQuantity = (item = {}) => {
  const qty = Number(item.quantity);
  return Number.isFinite(qty) && qty > 0 ? qty : 0;
};

/**
 * Sum line-item totals for a single cart or order.
 * Only uses that document's own items — never aggregates across users.
 */
const sumLineItems = (items = []) =>
  (Array.isArray(items) ? items : []).reduce((sum, item) => {
    return sum + resolveLinePrice(item) * resolveLineQuantity(item);
  }, 0);

/** Recalculate and assign totalPrice on a cart/order-like document from its items. */
const recalculateDocumentTotal = (doc) => {
  if (!doc) return 0;
  const total = sumLineItems(doc.items);
  doc.totalPrice = total;
  return total;
};

/**
 * Resolve missing line prices from Product collection, then sum.
 * Used when stored order line prices are missing/zero but product refs exist.
 */
const sumLineItemsWithProductFallback = async (items = []) => {
  const list = Array.isArray(items) ? items : [];
  let total = 0;

  for (const item of list) {
    let price = resolveLinePrice(item);
    const quantity = resolveLineQuantity(item);

    if (!price && item.productId) {
      const productId =
        typeof item.productId === 'object' && item.productId._id
          ? item.productId._id
          : item.productId;
      const product = await Product.findById(productId).select('price name').lean();
      if (product?.price != null) {
        price = Number(product.price) || 0;
      }
    }

    total += price * quantity;
  }

  return total;
};

module.exports = {
  resolveLinePrice,
  resolveLineQuantity,
  sumLineItems,
  recalculateDocumentTotal,
  sumLineItemsWithProductFallback,
};
