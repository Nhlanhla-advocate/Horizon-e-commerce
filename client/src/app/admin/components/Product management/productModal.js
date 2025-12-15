'use client';

import { useState, useEffect } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/productManagement.css';

export default function ProductModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  editingProduct,
  error 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '42rem', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
        <div style={{ padding: '1.5rem', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {/* Modal Header */}
          <div className="product-management-form-header" style={{ marginBottom: '1.5rem' }}>
            <h3 className="product-management-form-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="product-management-form-close"
              style={{ fontSize: '1.25rem', fontWeight: 'bold', cursor: 'pointer' }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="admin-alert admin-alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Modal Form */}
          <form className="product-management-form" onSubmit={handleSubmit}>
            <div className="product-management-form-field-full">
              <label className="admin-form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="admin-form-input"
                required
                placeholder="Enter product name"
              />
            </div>
            <div className="product-management-form-field-full">
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
                placeholder="Enter product description"
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
                placeholder="0.00"
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
                placeholder="0"
              />
            </div>
            <div className="product-management-form-actions">
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (editingProduct ? 'Update Product' : 'Create Product')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="admin-btn admin-btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
