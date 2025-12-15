'use client';

import { useState, useEffect, useCallback } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/productManagement.css';
import Pagination from '../Pagination';
import ProductModal from './productModal';

// Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sort: 'createdAt',
    order: 'desc',
    search: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: ''
  });
  const [pagination, setPagination] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: ''
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${BASE_URL}/dashboard/products?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Products response:', data); // Debug log
      setProducts(data.data || []);
      setPagination(data.pagination || {});
      console.log('Pagination set to:', data.pagination); // Debug log
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      stock: '',
      description: ''
    });
    setEditingProduct(null);
  };

  const handleAddProduct = async (productData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(`${BASE_URL}/dashboard/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      let data = {};
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
      }

      if (!response.ok) {
        // Check for validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        throw new Error(data.error || data.message || `Failed to add product (${response.status})`);
      }

      await fetchProducts();
      setShowAddForm(false);
      resetForm();
      
      // Dispatch event to notify charts to refresh
      window.dispatchEvent(new CustomEvent('product-updated'));
    } catch (err) {
      setError(err.message || 'Failed to add product. Please try again.');
      console.error('Error adding product:', err);
    }
  };

  const handleEditProduct = async (productId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/dashboard/products/${productId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      await fetchProducts();
      
      // Small delay to ensure backend has fully processed the update
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setEditingProduct(null);
      setShowAddForm(false);
      resetForm();
      
      // Dispatch event to notify charts to refresh
      console.log('Product updated, dispatching product-updated event...', { productId, updates });
      window.dispatchEvent(new CustomEvent('product-updated', { 
        detail: { productId, updates } 
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    if (!productId) {
      setError('Product ID is missing. Cannot delete product.');
      console.error('Product ID is missing');
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log('Attempting to delete product:', productId);
      console.log('URL:', `${BASE_URL}/dashboard/products/${productId}`);

      const response = await fetch(`${BASE_URL}/dashboard/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      let data = {};
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
      }
      
      console.log('Delete response data:', data);

      if (!response.ok) {
        // Check for validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
          throw new Error(`Validation error: ${errorMessages}`);
        }
        throw new Error(data.error || data.message || `Failed to delete product (${response.status})`);
      }

      // Success - refresh the product list
      console.log('Product deleted successfully, refreshing list...');
      await fetchProducts();
      
      // Dispatch event to notify charts to refresh
      window.dispatchEvent(new CustomEvent('product-updated'));
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete product. Please try again.';
      setError(errorMessage);
      console.error('Error deleting product:', err);
      alert(`Error: ${errorMessage}`);
    }
  };

  const [searchInput, setSearchInput] = useState('');

  // Debounce search input
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchInput,
        page: 1 // Reset to first page when searching
      }));
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimer);
  }, [searchInput]);

  // Sync searchInput with filters.search on mount or external changes
  useEffect(() => {
    setSearchInput(filters.search || '');
  }, []); // Only on mount

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setFilters(prev => ({
      ...prev,
      search: '',
      page: 1
    }));
  };

  return (
    <div className="product-management-container">
      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <div className="product-management-header">
          <div>
            <h2 className="product-management-title">Product Management</h2>
            <p className="product-management-subtitle">Manage your product catalog and keep inventory up to date.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              resetForm();
            }}
            className="admin-btn admin-btn-primary"
          >
            Add Product
          </button>
        </div>

        {/* Contextual Search Bar */}
        <div className="product-management-search-container">
          <div className="product-management-search-wrapper">
            <svg 
              className="product-management-search-icon" 
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
              className="product-management-search-input"
              placeholder="Search products by name, category, or description..."
              value={searchInput}
              onChange={handleSearchChange}
            />
            {filters.search && (
              <button
                type="button"
                className="product-management-search-clear"
                onClick={handleSearchClear}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="product-management-loading">
          <div className="admin-spinner" style={{ width: '2.5rem', height: '2.5rem', borderTopColor: '#2563eb', borderWidth: '4px' }}></div>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-card product-management-empty" style={{ borderStyle: 'dashed' }}>
          <p className="product-management-empty-text">No products found. Try adjusting your filters or add a new product.</p>
        </div>
      ) : (
        <div className="product-management-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="product-management-table-cell-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="product-management-table-cell-primary">{product.name}</td>
                  <td className="product-management-table-cell-secondary">{product.category}</td>
                  <td className="product-management-table-cell-primary">
                    {typeof product.price === 'number' ? `R ${product.price.toFixed(2)}` : product.price}
                  </td>
                  <td className="product-management-table-cell-primary">{product.stock}</td>
                  <td className="product-management-table-cell-right">
                    <div className="product-management-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(product);
                          setFormData({
                            name: product.name || '',
                            price: product.price || '',
                            category: product.category || '',
                            stock: product.stock || '',
                            description: product.description || ''
                          });
                          setShowAddForm(true);
                        }}
                        className="admin-btn admin-btn-secondary"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const productId = product._id || product.id;
                          console.log('Delete button clicked for product:', productId);
                          console.log('Full product object:', product);
                          if (!productId) {
                            alert('Error: Product ID is missing');
                            return;
                          }
                          await handleDeleteProduct(productId);
                        }}
                        className="admin-btn admin-btn-danger"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination - Always show if we have pagination data */}
      {!loading && pagination && Object.keys(pagination).length > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={(newPage, newLimit) => {
            setFilters(prev => ({
              ...prev,
              page: newPage,
              ...(newLimit && { limit: newLimit })
            }));
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          resetForm();
        }}
        onSubmit={async (productData) => {
          if (editingProduct) {
            await handleEditProduct(editingProduct._id, productData);
          } else {
            await handleAddProduct(productData);
          }
        }}
        formData={formData}
        setFormData={setFormData}
        editingProduct={editingProduct}
        error={error}
      />
    </div>
  );
}