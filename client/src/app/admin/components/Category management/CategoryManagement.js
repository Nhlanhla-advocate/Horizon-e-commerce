'use client';

import { useState, useEffect } from 'react';
import '../../../assets/css/admin.css';

//Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: ''
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const queryParams = new URLSearchParams();
            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            const response = await fetch(`${BASE_URL}/admin/categories?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data.categories || data.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [searchTerm]);

    //Debounce search
    useEffect(() => {
        const searchTimer = setTimeout(() => {
            fetchCategories();
        }, 300);

        return () => clearTimeout(searchTimer);
    }, [searchTerm]);

    //Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            slug: ''
        });
        setEditingCategory(null);
        setError(null);
        setSuccess(null);
    };

    //Generate slug from name
    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    //Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            //Auto-generate slug from name if slug is empty or matches old name
            if (name === 'name' && (!prev.slug || prev.slug === generateSlug(prev.name))) {
                updated.slug = generateSlug(value);
            }
            return updated;
        });
    };

    //Handle add category
    const handleAddCategory = async (e) => {
        e.preventDefault();

        try {
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            //Generate slug if not provided
            const categoryData = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name)
            };

            const response = await fetch(`${BASE_URL}/admin/categories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to add category');
            }
        
            setSuccess('Category added successfully!');
            await fetchCategories();
            setShowAddForm(false);
            resetForm();

            //Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error adding category:', err);
            setError(err.message);
        }
    };

    //Handle edit category
    const handleEditCategory = async (e) => {
        e.preventDefault();

        if (!editingCategory) return;

        try {
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            //Generate slug if not provided
            const categoryData = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name)
            };

            const response = await fetch(`${BASE_URL}/admin/categories/${editingCategory._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update category');
            }

            setSuccess('Category updated successfully!');

            await fetchCategories();
            setShowAddForm(false);
            resetForm();

            //Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error updating category', err);
            setError(err.message);
        }
    };

    //Handle delete category
    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingCategoryId(categoryId);
            setError(null);
            setSuccess(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${BASE_URL}/admin/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete category');
            }

            setSuccess('Category deleted successfully!');
            await fetchCategories();

            //Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting category:', err);
            setError(err.message);
        } finally {
            setDeletingCategoryId(null);
        }
    };

    //Handle edit button click
    const handleEditClick = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            slug: category.slug || generateSlug(category.name || '')
        });
        setShowAddForm(true);
        setError(null);
        setSuccess(null);
    };

    //Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        resetForm();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">Category Management</h2>
                    <p className="dashboard-subtitle">Manage product categories</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                    }}
                    className="admin-btn admin-btn-primary"
                >
                    Add Category
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="admin-error-message">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-success-message">
                    {success}
                </div>
            )}

            {/* Search */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label className="filter-label">Search Categories</label>
                <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="filter-input"
                    style={{ width: '100%', maxWidth: '400px' }}
                />
            </div>

            {/* Loading State */}
            {loading && categories.length === 0 ? (
                <div className="dashboard-loading">
                    <div className="admin-spinner"></div>
                </div>
            ) : categories.length === 0 ? (
                <div className="orders-empty">
                    <p>No categories found. Add a new category to get started.</p>
                </div>
            ) : (
                /* Categories Table */
                <div className="orders-wrapper">
                    <div className="orders-table-wrapper">
                        <table className="orders-table">
                            <thead>
                                <tr className="orders-head-row">
                                    <th className="orders-th">Name</th>
                                    <th className="orders-th">Slug</th>
                                    <th className="orders-th">Description</th>
                                    <th className="orders-th">Created</th>
                                    <th className="orders-th">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(category => (
                                    <tr key={category._id} className="orders-tr">
                                        <td className="orders-td">
                                            <strong>{category.name}</strong>
                                        </td>
                                        <td className="orders-td mono-text">
                                            {category.slug || 'N/A'}
                                        </td>
                                        <td className="orders-td">
                                            {category.description || 'No description'}
                                        </td>
                                        <td className="orders-td mono-text">
                                            {category.createdAt 
                                                ? new Date(category.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })
                                                : 'N/A'}
                                        </td>
                                        <td className="orders-td">
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEditClick(category)}
                                                    className="admin-btn admin-btn-secondary"
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category._id)}
                                                    disabled={deletingCategoryId === category._id}
                                                    className="admin-btn"
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: '#ef4444',
                                                        color: 'white',
                                                        opacity: deletingCategoryId === category._id ? 0.6 : 1,
                                                        cursor: deletingCategoryId === category._id ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {deletingCategoryId === category._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddForm && (
                <div 
                    className="admin-modal-overlay" 
                    onClick={handleFormClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <div 
                        className="admin-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h3>
                            <button
                                onClick={handleFormClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6b7280'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="filter-label">Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="filter-input"
                                    required
                                    placeholder="e.g., Electronics"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label className="filter-label">Slug</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleInputChange}
                                    className="filter-input filter-mono"
                                    placeholder="Auto-generated from name"
                                    style={{ width: '100%' }}
                                />
                                <p className="filter-help">URL-friendly identifier (auto-generated if left empty)</p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="filter-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="filter-input"
                                    rows="4"
                                    placeholder="Enter category description..."
                                    style={{ width: '100%', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleFormClose}
                                    className="admin-btn admin-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="admin-btn admin-btn-primary"
                                >
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
