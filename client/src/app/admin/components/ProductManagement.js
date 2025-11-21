'use client';

import { useState, useEffect, useCallback } from 'react';
import '../../assets/css/admin.css';

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
    stock: ''
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

      const response = await fetch(`/dashboard/products?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data || []);
      setPagination(data.pagination || {});
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
      stock: ''
    });
    setEditingProduct(null);
  };

  const handleAddProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/dashboard/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      setShowAddForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditProduct = async (productId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/dashboard/products/${productId}`, {
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/dashboard/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      fetchProducts();
    } catch (err) {
      setError(err.message);
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
                            stock: product.stock || ''
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
                required
              />
            </div>
            <div>
              <label className="admin-form-label">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="admin-form-input"
              />
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