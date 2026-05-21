'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/components/cart/Cart';
import { FaSearch, FaTimes } from 'react-icons/fa';
import '@/app/assets/css/product.css';
import '@/app/assets/css/categoryPage.css';
import { productMatchesSearchQuery } from '@/app/utils/productSearch';

const normalizeProductImagePath = (value) => {
  if (typeof value !== 'string') return '/Pictures/placeholder.jpg';

  const cleaned = value
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/[,\s]+$/g, '');

  if (!cleaned) return '/Pictures/placeholder.jpg';
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

const resolveProductImage = (product) => {
  const rawImage = Array.isArray(product?.images) && product.images.length > 0
    ? product.images[0]
    : product?.image;

  return normalizeProductImagePath(rawImage);
};

const resolveProductImageCandidates = (product) => {
  const candidates = [];
  const rawImage = Array.isArray(product?.images) && product.images.length > 0
    ? product.images[0]
    : product?.image;

  if (rawImage) candidates.push(rawImage);
  if (product?.name) {
    candidates.push(product.name);
    candidates.push(String(product.name).replace(/\bnecklace\b/gi, 'necklaces'));
  }

  const normalized = candidates
    .map(normalizeProductImagePath)
    .filter(Boolean);

  return [...new Set(normalized)];
};

const toTitleCase = (value) => 
  String(value || '')
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ');

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

const getNormalizedCategoryKey = (product) => {
  const categoryValue = String(product?.category || '')
    .trim()
    .toLowerCase();

  const searchableValues = [
    categoryValue,
    String(product?.name || '').toLowerCase(),
    String(product?.image || '').toLowerCase(),
  ];

  const isJewelryProduct = searchableValues.some((value) =>
    JEWELRY_KEYWORDS.some((keyword) => value.includes(keyword))
  );

  const isWatchProduct = searchableValues.some((value) =>
    WATCH_KEYWORDS.some((keyword) => value.includes(keyword))
  );

  if (isJewelryProduct) return 'jewelry';
  if (isWatchProduct) return 'watches';
  return categoryValue || 'uncategorized';
};

const VISIBLE_CAROUSEL_ITEMS = 4;

const ProductImage = ({ product }) => (
  <img
    src={product.image}
    alt={product.name}
    className="product-image"
    width={250}
    height={250}
    loading="lazy"
    style={{ objectFit: 'cover' }}
    onError={(event) => {
      const candidates = Array.isArray(product.imageCandidates) ? product.imageCandidates : [];
      const currentIndex = Number(event.currentTarget.dataset.candidateIndex || 0);
      const nextIndex = currentIndex + 1;

      if (nextIndex < candidates.length) {
        event.currentTarget.dataset.candidateIndex = String(nextIndex);
        event.currentTarget.src = candidates[nextIndex];
        return;
      }

      event.currentTarget.src = '/Pictures/placeholder.jpg';
    }}
    data-candidate-index="0"
  />
);

const CategoryProductCard = ({
  product,
  addToCart,
  formatPrice,
  className = '',
  onClick,
  onMouseEnter,
}) => (
  <article
    className={`product-card ${className}`.trim()}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
  >
    <div className="product-image-container">
      <Link href={`/products/${product.slug}`}>
        <div className="image-wrapper">
          <ProductImage product={product} />
          {product.stockQuantity === 0 && (
            <div className="out-of-stock-badge">Out of Stock</div>
          )}
        </div>
      </Link>
    </div>

    <div className="product-info">
      <Link href={`/products/${product.slug}`}>
        <h3 className="product-name">{product.name}</h3>
      </Link>
      <div className="product-category">{toTitleCase(product.category)}</div>
      <div className="product-price">{formatPrice(product.price)}</div>
      <div className="product-stock">
        {product.stockQuantity > 0 ? (
          <span className="in-stock">{product.stockQuantity} in stock</span>
        ) : (
          <span className="out-of-stock">Out of stock</span>
        )}
      </div>
      <button
        type="button"
        className="add-to-cart-button"
        onClick={() =>
          addToCart(product._id, 1, {
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description,
            category: product.category,
          })
        }
        disabled={product.stockQuantity === 0}
      >
        Add to Cart
      </button>
    </div>
  </article>
);

const CategoryProductsGrid = ({ products, addToCart, formatPrice }) => (
  <div className="products-grid category-products-grid">
    {products.map((product) => (
      <CategoryProductCard
        key={product._id || product.id}
        product={product}
        addToCart={addToCart}
        formatPrice={formatPrice}
      />
    ))}
  </div>
);

          ))}
        </div>
      </div>
      {canSlide && (
        <p className="category-carousel-hint">
          {isPaused
            ? 'Paused — move away and hover the first product to browse again'
            : isSliding
              ? 'Browsing products… click any card to pause and interact'
              : 'Hover the first product to browse more'}
        </p>
      )}
    </div>
  );
};

const CategoryPage = () => {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeCarousel, setActiveCarousel] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  const activateCarousel = useCallback((categoryName) => {
    setActiveCarousel(categoryName);
  }, []);

  const deactivateCarousel = useCallback(() => {
    setActiveCarousel(null);
  }, []);

  const toggleCategoryExpanded = useCallback((categoryName) => {
    setExpandedCategories((prev) => {
      const isExpanded = Boolean(prev[categoryName]);
      if (!isExpanded) {
        setActiveCarousel(null);
      }
      return { ...prev, [categoryName]: !isExpanded };
    });
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setFetchError('');

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const initialResponse = await fetch(`${baseUrl}/products?page=1&limit=100`);
        if (!initialResponse.ok) {
          throw new Error('Unable to load products by category.');
        }

        const initialResult = await initialResponse.json();
        const totalPages = Number(initialResult?.pagination?.pages || 1);
        const allRawProducts = Array.isArray(initialResult?.data) ? [...initialResult.data] : [];

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, idx) =>
            fetch(`${baseUrl}/products?page=${idx + 2}&limit=100`).then((response) => {
              if (!response.ok) {
                throw new Error('Unable to load products by category.');
              }
              return response.json();
            })
          );

          const remainingPageResults = await Promise.all(pageRequests);
          remainingPageResults.forEach((pageResult) => {
            if (Array.isArray(pageResult?.data)) {
              allRawProducts.push(...pageResult.data);
            }
          });
        }

        const normalizedProducts = allRawProducts.map((product, index) => {
          const stockQuantity = typeof product.stockQuantity === 'number'
            ? product.stockQuantity
            : typeof product.stock === 'number'
              ? product.stock
              : 0;
          return {
            ...product,
            id: product.id ?? index + 1,
            image: resolveProductImage(product),
            imageCandidates: resolveProductImageCandidates(product),
            stockQuantity,
            slug:
              product.slug ||
              `${product.name?.toLowerCase().replace(/\s+/g, '-') || 'product'}-${product._id}`,
          };
        });

        setProducts(normalizedProducts);
      } catch (error) {
        setFetchError(error.message || 'Failed to fetch category products.');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    // Search is handled via local filtering.
  };

  const clearSearch = () => setSearchQuery('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    return products.filter((product) => productMatchesSearchQuery(product, searchQuery));
  }, [products, searchQuery]);

  const groupedProducts = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const key = getNormalizedCategoryKey(product);
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {});
  }, [filteredProducts]);

  const sortedCategoryNames = useMemo(
    () => Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b)),
    [groupedProducts]
  );

  const hasSlidableCategories = useMemo(
    () =>
      sortedCategoryNames.some(
        (categoryName) => groupedProducts[categoryName].length > VISIBLE_CAROUSEL_ITEMS
      ),
    [sortedCategoryNames, groupedProducts]
  );

  const formatPrice = (price) =>
    `R ${Number(price || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  return (
    <div className="products-page-container category-page-container">
      <div className="page-header">
        <h1 className="page-title">Shop by Category</h1>
        <p className="page-description">Look for your favorite products in our amazing categories.</p>
      </div>

      {!isLoading && !fetchError && (
        <div className="products-controls">
          <div className="search-box">
            <form onSubmit={handleSearch} className="navbar-search-wrapper">
              <div className="navbar-search-relative">
                <div className="navbar-search-icon">
                  <FaSearch />
                </div>
                <input
                  className="navbar-search-input"
                  placeholder="Search category..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="navbar-search-clear"
                    onClick={clearSearch}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                    }}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="empty-state">
          <h3>Loading category products...</h3>
        </div>
      )}

      {!isLoading && fetchError && (
        <div className="empty-state">
          <h3>Could not load categories</h3>
          <p>{fetchError}</p>
        </div>
      )}

      {!isLoading && !fetchError && products.length === 0 && !searchQuery.trim() && (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Add products to your database and they will appear here grouped by category.</p>
        </div>
      )}

      {!isLoading && !fetchError && filteredProducts.length === 0 && searchQuery && (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try adjusting your search terms or browse all categories.</p>
          <button onClick={clearSearch} className="reset-filters-button">
            Clear Search
          </button>
        </div>
      )}

      {!isLoading && !fetchError && hasSlidableCategories && sortedCategoryNames.length > 0 && (
        <p className="category-page-hint">Hover the first product to browse more</p>
      )}

      {!isLoading &&
        !fetchError &&
        sortedCategoryNames.map((categoryName) => {
          const isExpanded = Boolean(expandedCategories[categoryName]);

          return (
          <section key={categoryName} className="category-section">
            <div className="category-section-header">
              <h2 className="category-title">{toTitleCase(categoryName)}</h2>
              <button
                type="button"
                className="category-view-products-button"
                onClick={() => toggleCategoryExpanded(categoryName)}
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'Show Less' : 'View Products'}
              </button>
            </div>
            {isExpanded ? (
              <CategoryProductsGrid
                products={groupedProducts[categoryName]}
                addToCart={addToCart}
                formatPrice={formatPrice}
              />
            ) : (
              <CategoryProductCarousel
                products={groupedProducts[categoryName]}
                isActive={activeCarousel === categoryName}
                onActivate={() => activateCarousel(categoryName)}
                onDeactivate={deactivateCarousel}
                addToCart={addToCart}
                formatPrice={formatPrice}
              />
            )}
          </section>
          );
        })}
    </div>
  );
};


export default CategoryPage;