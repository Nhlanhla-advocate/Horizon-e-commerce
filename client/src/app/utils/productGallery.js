/**
 * Image paths and sibling grouping for product detail thumbnails.
 * Thumbnails show other products in the same visual family (e.g. PS5 with PS5/PS4, earrings with earrings).
 */

export const normalizeProductImagePath = (value) => {
  if (typeof value !== 'string') return '';

  const cleaned = value
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/[,\s]+$/g, '');

  if (!cleaned) return '';
  if (cleaned.startsWith('http')) return cleaned;

  const normalized = cleaned
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^client\/public\//i, '')
    .replace(/^public\//i, '')
    .replace(/^\//, '');

  const hasFileExtension = /\.[a-z0-9]{2,5}$/i.test(
    normalized.split('?')[0].split('#')[0].split('/').pop() || ''
  );
  const normalizedWithExtension = hasFileExtension ? normalized : `${normalized}.jpg`;

  if (/^pictures\//i.test(normalizedWithExtension)) return `/${normalizedWithExtension}`;
  if (!normalizedWithExtension.includes('/')) return `/Pictures/${normalizedWithExtension}`;
  return `/${normalizedWithExtension}`;
};

export const resolveProductPrimaryImage = (product) => {
  const rawImage =
    Array.isArray(product?.images) && product.images.length > 0
      ? product.images[0]
      : product?.image;

  const candidates = [];
  if (rawImage) candidates.push(rawImage);
  if (product?.name) {
    candidates.push(product.name);
    candidates.push(String(product.name).replace(/\bnecklace\b/gi, 'necklaces'));
  }

  const normalized = candidates.map(normalizeProductImagePath).filter(Boolean);
  return normalized[0] || '/Pictures/placeholder.jpg';
};

const WATCH_KEYWORDS = ['watch', 'watches', 'casio'];
const JEWELRY_KEYWORDS = [
  'jewelry',
  'jewellery',
  'earring',
  'earrings',
  'earing',
  'earings',
  'necklace',
  'necklaces',
];

/** Groups products for thumbnail siblings (finer than API category when needed). */
export const getGalleryGroupKey = (product) => {
  const category = String(product?.category || '').trim().toLowerCase();
  const name = String(product?.name || '').trim().toLowerCase();
  const image = String(product?.image || '').trim().toLowerCase();
  const haystack = `${category} ${name} ${image}`;

  if (
    haystack.includes('playstation') ||
    /\bps[45]?\b/.test(haystack) ||
    haystack.includes('ps5') ||
    haystack.includes('ps4')
  ) {
    return 'playstation';
  }

  if (/\bearring|\bearings\b/.test(haystack)) return 'earring';
  if (/\bnecklace|\bnecklaces\b/.test(haystack)) return 'necklace';

  const isJewelry = JEWELRY_KEYWORDS.some((keyword) => haystack.includes(keyword));
  if (isJewelry) return 'jewelry';

  const isWatch = WATCH_KEYWORDS.some((keyword) => haystack.includes(keyword));
  if (isWatch) return 'watches';

  return category || 'uncategorized';
};

export const isSameGalleryGroup = (a, b) => {
  if (!a || !b) return false;
  return getGalleryGroupKey(a) === getGalleryGroupKey(b);
};

export const buildProductDetailHref = (item) => {
  if (!item?._id) return '#';
  const baseSlug =
    typeof item.slug === 'string' && item.slug.trim().length > 0
      ? item.slug.trim()
      : String(item.name || 'product')
          .toLowerCase()
          .replace(/\s+/g, '-');

  const slugWithId = baseSlug.endsWith(item._id) ? baseSlug : `${baseSlug}-${item._id}`;
  return `/products/${slugWithId}`;
};

/**
 * @param {object} product - current product
 * @param {object[]} categoryProducts - products from same API category
 * @param {number} maxItems
 */
export const PRODUCT_DETAIL_THUMBNAIL_COUNT = 5;

export const buildCategoryGalleryItems = (
  product,
  categoryProducts,
  maxItems = PRODUCT_DETAIL_THUMBNAIL_COUNT
) => {
  if (!product) return [];

  const currentId = product._id?.toString();
  const currentImage = resolveProductPrimaryImage(product);

  const items = [
    {
      key: currentId || 'current',
      productId: currentId,
      image: currentImage,
      name: product.name,
      href: buildProductDetailHref(product),
      isCurrent: true,
    },
  ];

  const seenImages = new Set([currentImage]);

  const siblings = (Array.isArray(categoryProducts) ? categoryProducts : [])
    .filter((item) => item?._id && item._id.toString() !== currentId)
    .filter((item) => isSameGalleryGroup(product, item));

  for (const item of siblings) {
    if (items.length >= maxItems) break;

    const image = resolveProductPrimaryImage(item);
    if (!image || seenImages.has(image)) continue;

    seenImages.add(image);
    items.push({
      key: item._id.toString(),
      productId: item._id.toString(),
      image,
      name: item.name,
      href: buildProductDetailHref(item),
      isCurrent: false,
    });
  }

  return items;
};
