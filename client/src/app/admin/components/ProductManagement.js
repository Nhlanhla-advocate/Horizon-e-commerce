'use client';

import { useState, useEffect, useCallback } from 'react';
import '../../assets/css/admin.css';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
    description: '',
    featured: false
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/dashboard/products?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.error || data.message || 'Failed to fetch products';
        throw new Error(errorMessage);
      }

      // Handle both response formats
      if (data.success !== false) {
        setProducts(data.data || []);
        setPagination(data.pagination || {});
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
      setProducts([]);
      setPagination({});
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
      description: '',
      featured: false
    });
    setEditingProduct(null);
  };

  const handleAddProduct = async (productData) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      // Convert price and stock to numbers, and ensure category is lowercase
      const formattedData = {
        ...productData,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock, 10),
        category: productData.category.toLowerCase()
      };

      // Validate that price and stock are valid numbers
      if (isNaN(formattedData.price) || formattedData.price < 0) {
        throw new Error('Price must be a valid positive number');
      }
      if (isNaN(formattedData.stock) || formattedData.stock < 0) {
        throw new Error('Stock must be a valid non-negative integer');
      }

      const response = await fetch('/dashboard/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract error message from response - check for validation errors
        let errorMessage = 'Failed to add product';
        if (data.error) {
          errorMessage = data.error;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (Array.isArray(data.errors)) {
          errorMessage = data.errors.map(e => e.msg || e.message).join(', ');
        }
        throw new Error(errorMessage);
      }

      setShowAddForm(false);
      resetForm();
      setError(null);
      setSuccessMessage('Product added successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      // Refresh the product list
      try {
        await fetchProducts();
      } catch (fetchErr) {
        // If fetch fails, don't overwrite success message immediately
        // The error will be shown by fetchProducts
        console.error('Failed to refresh product list:', fetchErr);
      }
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null);
    }
  };

  const handleEditProduct = async (productId, updates) => {
    try {
      const token = localStorage.getItem('token');
      
      // Convert price and stock to numbers if they exist, and ensure category is lowercase
      const formattedData = { ...updates };
      if (formattedData.price !== undefined) {
        formattedData.price = parseFloat(formattedData.price);
      }
      if (formattedData.stock !== undefined) {
        formattedData.stock = parseInt(formattedData.stock, 10);
      }
      if (formattedData.category) {
        formattedData.category = formattedData.category.toLowerCase();
      }

      const response = await fetch(`/dashboard/products/${productId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract error message from response
        const errorMessage = data.error || data.message || 'Failed to update product';
        throw new Error(errorMessage);
      }

      setEditingProduct(null);
      resetForm();
      setError(null);
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      try {
        await fetchProducts();
      } catch (fetchErr) {
        console.error('Failed to refresh product list:', fetchErr);
      }
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/dashboard/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Failed to delete product';
        throw new Error(errorMessage);
      }

      setError(null);
      setSuccessMessage('Product deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      try {
        await fetchProducts();
      } catch (fetchErr) {
        console.error('Failed to refresh product list:', fetchErr);
      }
    } catch (err) {
      setError(err.message);
      setSuccessMessage(null);
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
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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

      {successMessage && (
        <div className="admin-alert" style={{ 
          backgroundColor: '#d1fae5', 
          borderColor: '#10b981', 
          color: '#065f46',
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          {successMessage}
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
                            description: product.description || '',
                            featured: product.featured || false
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
                        onClick={() => handleDeleteProduct(product._id)}
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
            <div>
              <label className="admin-form-label">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="admin-form-input"
                min="0"
                step="0.01"
                required
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
                min="0"
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
                placeholder="Enter product description (minimum 10 characters)"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="admin-form-label">Featured Product</span>
                <span className="text-xs text-gray-500">(Will appear on the featured products section)</span>
              </label>
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