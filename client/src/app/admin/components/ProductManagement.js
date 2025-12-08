'use client';

import { useState, useEffect, useCallback } from 'react';
import '../../assets/css/admin.css';
import Pagination from './Pagination';

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

      setShowAddForm(false);
      resetForm();
      await fetchProducts();
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

      setEditingProduct(null);
      resetForm();
      fetchProducts();
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
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete product. Please try again.';
      setError(errorMessage);
      console.error('Error deleting product:', err);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (editingProduct) {
      handleEditProduct(editingProduct._id, formData);
    } else {
      handleAddProduct(formData);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
            <p className="text-sm text-gray-500">Manage your product catalog and keep inventory up to date.</p>
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
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center" style={{ height: '10rem' }}>
          <div className="admin-spinner" style={{ width: '2.5rem', height: '2.5rem', borderTopColor: '#2563eb', borderWidth: '4px' }}></div>
        </div>
      ) : products.length === 0 ? (
        <div className="admin-card text-center" style={{ borderStyle: 'dashed' }}>
          <p className="text-sm text-gray-500">No products found. Try adjusting your filters or add a new product.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="text-gray-900">{product.name}</td>
                  <td className="text-gray-500">{product.category}</td>
                  <td className="text-gray-900">
                    {typeof product.price === 'number' ? `R ${product.price.toFixed(2)}` : product.price}
                  </td>
                  <td className="text-gray-900">{product.stock}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
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

      {showAddForm && (
        <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
          <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <div className="sm:col-span-2">
              <label className="admin-form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="admin-form-input"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="admin-form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="admin-form-input"
                rows="4"
                required
                minLength="10"
                maxLength="2000"
                placeholder="Enter product description (minimum 10 characters)"
              />
            </div>
            <div>
              <label className="admin-form-label">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="admin-form-input"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="admin-form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="admin-form-input"
                required
              >
                <option value="">Select a category</option>
                <option value="jewelry">Jewelry</option>
                <option value="electronics">Electronics</option>
                <option value="consoles">Consoles</option>
                <option value="computers">Computers</option>
              </select>
            </div>
            <div>
              <label className="admin-form-label">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="admin-form-input"
                required
                min="0"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="admin-btn admin-btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}