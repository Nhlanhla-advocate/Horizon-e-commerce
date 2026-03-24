'use client';

import { useState, useEffect, useRef } from 'react';
import '../../assets/css/admin.css';
import '../../assets/css/searchBar.css';

const BASE_URL = 'http://localhost:5000';

// Available dashboard tabs for search
const DASHBOARD_TABS = [
  { id: 'overview', label: 'Dashboard', keywords: ['dashboard', 'overview', 'stats', 'statistics', 'home'], description: 'Overview and statistics' },
  { id: 'products', label: 'Products', keywords: ['products', 'product', 'inventory', 'items', 'goods'], description: 'Manage inventory' },
  { id: 'analytics', label: 'Analytics', keywords: ['analytics', 'analytics page', 'analysis', 'insights', 'sales', 'reports'], description: 'Sales insights' },
  { id: 'inventory', label: 'Alerts', keywords: ['alerts', 'inventory', 'stock alerts', 'warnings', 'notifications'], description: 'Stock alerts' },
  { id: 'reviews', label: 'Reviews', keywords: ['reviews', 'review', 'feedback', 'ratings', 'comments'], description: 'Customer feedback' },
  { id: 'cache', label: 'Performance', keywords: ['performance', 'cache', 'optimization', 'system'], description: 'System optimization' }
];

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    orders: [],
    reviews: [],
    tabs: [],
    maps: []
  });
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search function with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ products: [], orders: [], reviews: [], tabs: [], maps: [] });
      setShowResults(false);
      return;
    }

    const searchTimer = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 300); // Debounce 300ms

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setShowResults(true);

    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const queryLower = query.toLowerCase().trim();
      
      // Helper function to check if text starts with or contains query
      const matchesQuery = (text, query) => {
        if (!text) return false;
        const textLower = text.toLowerCase();
        // For single character, check if it starts with that character
        if (query.length === 1) {
          return textLower.startsWith(query);
        }
        // For longer queries, check if it contains the query
        return textLower.includes(query);
      };

      // Search tabs (client-side) - match by starting letter or contains
      const matchingTabs = DASHBOARD_TABS.filter(tab => 
        matchesQuery(tab.label, queryLower) ||
        tab.keywords.some(keyword => matchesQuery(keyword, queryLower)) ||
        matchesQuery(tab.description, queryLower)
      ).map(tab => ({ ...tab, type: 'tab' }));

      // Search maps (if query starts with or contains map-related keywords)
      const mapsResults = [];
      const mapKeywords = ['map', 'maps', 'location', 'locations', 'geography', 'geographic'];
      if (mapKeywords.some(keyword => matchesQuery(keyword, queryLower))) {
        mapsResults.push({
          _id: 'maps',
          name: 'Maps',
          description: 'View geographic data and locations',
          type: 'map'
        });
      }

      // Search all entities in parallel
      // For single character searches, fetch more results and filter client-side
      const limit = query.length === 1 ? 20 : 5;
      
      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${BASE_URL}/dashboard/products?search=${encodeURIComponent(query)}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false })),
        
        fetch(`${BASE_URL}/dashboard/orders?search=${encodeURIComponent(query)}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(() => ({ ok: false }))
      ]);

      let products = productsRes.ok ? await productsRes.json().then(d => d.data || []).catch(() => []) : [];
      let orders = ordersRes.ok ? await ordersRes.json().then(d => d.data || []).catch(() => []) : [];
      
      // For single character searches, filter to items that start with that letter
      if (query.length === 1) {
        products = products.filter(product => 
          product.name?.toLowerCase().startsWith(queryLower) ||
          product.category?.toLowerCase().startsWith(queryLower) ||
          product.description?.toLowerCase().startsWith(queryLower)
        ).slice(0, 5);
        
        orders = orders.filter(order => 
          order.customerId?.username?.toLowerCase().startsWith(queryLower) ||
          order.guestDetails?.name?.toLowerCase().startsWith(queryLower) ||
          order.guestDetails?.email?.toLowerCase().startsWith(queryLower) ||
          order._id?.toString().toLowerCase().startsWith(queryLower) ||
          order.items?.some(item => item.name?.toLowerCase().startsWith(queryLower))
        ).slice(0, 5);
      }
      
      // Search reviews - for single letter, fetch all products starting with that letter
      const reviews = [];
      if (query.length === 1) {
        // For single character, fetch products that start with that letter
        try {
          const allProductsRes = await fetch(`${BASE_URL}/dashboard/products?limit=20`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (allProductsRes.ok) {
            const allProductsData = await allProductsRes.json();
            const allProducts = allProductsData.data || [];
            const matchingProducts = allProducts.filter(product => 
              product.name?.toLowerCase().startsWith(queryLower) ||
              product.category?.toLowerCase().startsWith(queryLower)
            ).slice(0, 5);
            
            // Search reviews for matching products
            const reviewPromises = matchingProducts.map(async (product) => {
              try {
                const reviewRes = await fetch(`${BASE_URL}/dashboard/products/${product._id}/reviews?limit=3`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                if (reviewRes.ok) {
                  const reviewData = await reviewRes.json();
                  if (reviewData.success && reviewData.data.reviews) {
                    // Filter reviews that start with the query
                    const matchingReviews = reviewData.data.reviews.filter(review => 
                      review.comment?.toLowerCase().startsWith(queryLower) ||
                      review.user?.username?.toLowerCase().startsWith(queryLower) ||
                      review.user?.email?.toLowerCase().startsWith(queryLower)
                    );
                    
                    return matchingReviews.map(review => ({
                      ...review,
                      productName: product.name,
                      productId: product._id
                    }));
                  }
                }
              } catch (err) {
                console.error(`Error fetching reviews for product ${product._id}:`, err);
              }
              return [];
            });
            
            const reviewArrays = await Promise.all(reviewPromises);
            reviews.push(...reviewArrays.flat());
          }
        } catch (err) {
          console.error('Error fetching products for review search:', err);
        }
      } else if (products.length > 0) {
        // For longer queries, use existing logic
        // Search reviews for matching products
        const reviewPromises = products.slice(0, 3).map(async (product) => {
          try {
            const reviewRes = await fetch(`${BASE_URL}/dashboard/products/${product._id}/reviews?limit=3`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (reviewRes.ok) {
              const reviewData = await reviewRes.json();
              if (reviewData.success && reviewData.data.reviews) {
                // Filter reviews that match the search query
                const matchingReviews = reviewData.data.reviews.filter(review => 
                  review.comment?.toLowerCase().includes(queryLower) ||
                  review.user?.username?.toLowerCase().includes(queryLower) ||
                  review.user?.email?.toLowerCase().includes(queryLower)
                );
                
                return matchingReviews.map(review => ({
                  ...review,
                  productName: product.name,
                  productId: product._id
                }));
              }
            }
          } catch (err) {
            console.error(`Error fetching reviews for product ${product._id}:`, err);
          }
          return [];
        });
        
        const reviewArrays = await Promise.all(reviewPromises);
        reviews.push(...reviewArrays.flat());
      }

      setResults({ 
        products, 
        orders, 
        reviews: reviews.slice(0, 5), // Limit to 5 reviews
        tabs: matchingTabs,
        maps: mapsResults
      });
    } catch (error) {
      console.error('Search error:', error);
      setResults({ products: [], orders: [], reviews: [], tabs: [], maps: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (type, item) => {
    setShowResults(false);
    setSearchQuery('');
    
    // Navigate to the appropriate tab via custom event
    if (type === 'product') {
      window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'products' }));
    } else if (type === 'order') {
      // Navigate to orders if that tab exists
      window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'orders' }));
    } else if (type === 'review') {
      // Navigate to reviews tab
      window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: 'reviews' }));
    } else if (type === 'tab') {
      // Navigate to the specific tab
      window.dispatchEvent(new CustomEvent('admin-tab-change', { detail: item.id }));
    } else if (type === 'map') {
      // Navigate to maps (if maps tab exists, otherwise show message)
      // For now, we'll just log it since there's no maps tab yet
      console.log('Maps feature requested');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalResults = results.products.length + results.orders.length + results.reviews.length + results.tabs.length + results.maps.length;
  const displayResults = activeCategory === 'all' 
    ? { products: results.products, orders: results.orders, reviews: results.reviews, tabs: results.tabs, maps: results.maps }
    : activeCategory === 'products' 
    ? { products: results.products }
    : activeCategory === 'orders'
    ? { orders: results.orders }
    : activeCategory === 'reviews'
    ? { reviews: results.reviews }
    : activeCategory === 'tabs'
    ? { tabs: results.tabs }
    : activeCategory === 'maps'
    ? { maps: results.maps }
    : {};

  return (
    <div className="admin-search-container" ref={searchRef}>
      <div className="admin-search-input-wrapper">
        <svg 
          className="admin-search-icon" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          className="admin-search-input"
          placeholder="Search products, orders, users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim() && totalResults > 0) {
              setShowResults(true);
            }
          }}
        />
        {searchQuery && (
          <button
            type="button"
            className="admin-search-clear"
            onClick={() => {
              setSearchQuery('');
              setShowResults(false);
              setResults({ products: [], orders: [], reviews: [], tabs: [], maps: [] });
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.trim() && (
        <div className="admin-search-results" ref={resultsRef}>
          {loading ? (
            <div className="admin-search-loading">
              <div className="admin-spinner" style={{ width: '1rem', height: '1rem', borderTopColor: '#2563eb' }}></div>
              <span>Searching...</span>
            </div>
          ) : totalResults === 0 ? (
            <div className="admin-search-empty">
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              {/* Category Tabs */}
              <div className="admin-search-tabs">
                <button
                  className={`admin-search-tab ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  All ({totalResults})
                </button>
                {results.products.length > 0 && (
                  <button
                    className={`admin-search-tab ${activeCategory === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('products')}
                  >
                    Products ({results.products.length})
                  </button>
                )}
                {results.orders.length > 0 && (
                  <button
                    className={`admin-search-tab ${activeCategory === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('orders')}
                  >
                    Orders ({results.orders.length})
                  </button>
                )}
                {results.reviews.length > 0 && (
                  <button
                    className={`admin-search-tab ${activeCategory === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('reviews')}
                  >
                    Reviews ({results.reviews.length})
                  </button>
                )}
                {results.tabs.length > 0 && (
                  <button
                    className={`admin-search-tab ${activeCategory === 'tabs' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('tabs')}
                  >
                    Pages ({results.tabs.length})
                  </button>
                )}
                {results.maps.length > 0 && (
                  <button
                    className={`admin-search-tab ${activeCategory === 'maps' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('maps')}
                  >
                    Maps ({results.maps.length})
                  </button>
                )}
              </div>

              {/* Results List */}
              <div className="admin-search-results-list">
                {/* Products */}
                {(activeCategory === 'all' || activeCategory === 'products') && displayResults.products.length > 0 && (
                  <div className="admin-search-section">
                    <div className="admin-search-section-header">Products</div>
                    {displayResults.products.map((product) => (
                      <div
                        key={product._id}
                        className="admin-search-result-item"
                        onClick={() => handleResultClick('product', product)}
                      >
                        <div className="admin-search-result-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                          📦
                        </div>
                        <div className="admin-search-result-content">
                          <div className="admin-search-result-title">{product.name}</div>
                          <div className="admin-search-result-subtitle">
                            {product.category} • {formatCurrency(product.price)} • Stock: {product.stock}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Orders */}
                {(activeCategory === 'all' || activeCategory === 'orders') && displayResults.orders.length > 0 && (
                  <div className="admin-search-section">
                    <div className="admin-search-section-header">Orders</div>
                    {displayResults.orders.map((order) => (
                      <div
                        key={order._id}
                        className="admin-search-result-item"
                        onClick={() => handleResultClick('order', order)}
                      >
                        <div className="admin-search-result-icon" style={{ backgroundColor: '#dcfce7', color: '#059669' }}>
                          📋
                        </div>
                        <div className="admin-search-result-content">
                          <div className="admin-search-result-title">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </div>
                          <div className="admin-search-result-subtitle">
                            {order.customerId?.username || order.guestDetails?.name || 'Guest'} • {formatCurrency(order.totalPrice)} • {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reviews */}
                {(activeCategory === 'all' || activeCategory === 'reviews') && displayResults.reviews.length > 0 && (
                  <div className="admin-search-section">
                    <div className="admin-search-section-header">Reviews</div>
                    {displayResults.reviews.map((review) => (
                      <div
                        key={review._id}
                        className="admin-search-result-item"
                        onClick={() => handleResultClick('review', review)}
                      >
                        <div className="admin-search-result-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                          ⭐
                        </div>
                        <div className="admin-search-result-content">
                          <div className="admin-search-result-title">
                            {review.productName || 'Product Review'}
                          </div>
                          <div className="admin-search-result-subtitle">
                            {review.user?.username || review.user?.email || 'Anonymous'} • {review.rating}/5 • {review.comment?.substring(0, 50) || 'No comment'}...
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabs/Pages */}
                {(activeCategory === 'all' || activeCategory === 'tabs') && displayResults.tabs.length > 0 && (
                  <div className="admin-search-section">
                    <div className="admin-search-section-header">Dashboard Pages</div>
                    {displayResults.tabs.map((tab) => (
                      <div
                        key={tab.id}
                        className="admin-search-result-item"
                        onClick={() => handleResultClick('tab', tab)}
                      >
                        <div className="admin-search-result-icon" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>
                          📄
                        </div>
                        <div className="admin-search-result-content">
                          <div className="admin-search-result-title">{tab.label}</div>
                          <div className="admin-search-result-subtitle">{tab.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Maps */}
                {(activeCategory === 'all' || activeCategory === 'maps') && displayResults.maps.length > 0 && (
                  <div className="admin-search-section">
                    <div className="admin-search-section-header">Maps</div>
                    {displayResults.maps.map((map) => (
                      <div
                        key={map._id}
                        className="admin-search-result-item"
                        onClick={() => handleResultClick('map', map)}
                      >
                        <div className="admin-search-result-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
                          🗺️
                        </div>
                        <div className="admin-search-result-content">
                          <div className="admin-search-result-title">{map.name}</div>
                          <div className="admin-search-result-subtitle">{map.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
