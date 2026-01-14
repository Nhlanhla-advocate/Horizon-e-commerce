'use client';

import { useState, useEffect } from 'react';
import '../../../assets/css/admin.css';

//Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function CategoryManagementHierarchy() {
    const [categories, setCategories] = useState([]);
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        parent: ''
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${BASE_URL}/admin/categories?hierarchy=true`, {
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
            setCategories(data.flat || []);
            setCategoryTree(data.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    //Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            slug: '',
            parent: ''
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

    //Toggle expand/collapse
    const toggleExpand = (categoryId) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    //Get all parent options (excluding current category and its descendants)
    const getParentOptions = (excludeId = null) => {
        const getDescendants = (categoryId) => {
            const descendants = [categoryId];
            const findChildren = (parentId) => {
                categories.forEach(cat => {
                    if (cat.parent && cat.parent.toString() === parentId.toString()) {
                        descendants.push(cat._id);
                        findChildren(cat._id);
                    }
                });
            };
            if (excludeId) findChildren(excludeId);
            return descendants;
        };

        const excludeIds = excludeId ? getDescendants(excludeId) : [];
        return categories.filter(cat => !excludeIds.some(id => id.toString() === cat._id.toString()));
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

            const categoryData = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name),
                parent: formData.parent || null
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

            const categoryData = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name),
                parent: formData.parent || null
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
            slug: category.slug || generateSlug(category.name || ''),
            parent: category.parent?._id?.toString() || category.parent?.toString() || ''
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

    //Render category tree
    const renderCategoryTree = (tree, level = 0) => {
        return tree.map(category => {
            const hasChildren = category.children && category.children.length > 0;
            const isExpanded = expandedCategories.has(category._id.toString());
            const indent = level * 24;

            return (
                <div key={category._id} style={{ marginLeft: `${indent}px` }}>
                    <div 
                        className="orders-tr" 
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.75rem',
                            marginBottom: '0.25rem',
                            backgroundColor: level % 2 === 0 ? '#ffffff' : '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.375rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.75rem' }}>
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(category._id.toString())}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        fontSize: '0.875rem',
                                        color: '#6b7280'
                                    }}
                                >
                                    {isExpanded ? '▼' : '▶'}
                                </button>
                            ) : (
                                <span style={{ width: '1.5rem' }}></span>
                            )}
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <strong style={{ fontSize: '1rem' }}>{category.name}</strong>
                                    {category.parent && (
                                        <span style={{ 
                                            fontSize: '0.75rem', 
                                            color: '#6b7280',
                                            fontStyle: 'italic'
                                        }}>
                                            (Child of: {category.parent.name || 'Unknown'})
                                        </span>
                                    )}
                                    <span className={`status-badge status-${category.isActive ? 'active' : 'inactive'}`} style={{
                                        fontSize: '0.75rem',
                                        padding: '0.125rem 0.5rem',
                                        backgroundColor: category.isActive ? '#10b981' : '#ef4444',
                                        color: 'white'
                                    }}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {category.description && (
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                        {category.description}
                                    </p>
                                )}
                                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                    Slug: <span className="mono-text">{category.slug}</span> | 
                                    Level: {category.level || 0} | 
                                    Path: <span className="mono-text">{category.path || category.slug}</span>
                                </p>
                            </div>
                            
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
                        </div>
                    </div>
                    
                    {hasChildren && isExpanded && (
                        <div style={{ marginTop: '0.5rem' }}>
                            {renderCategoryTree(category.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">Category Hierarchy</h2>
                    <p className="dashboard-subtitle">Manage category tree structure</p>
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

            {/* Loading State */}
            {loading ? (
                <div className="dashboard-loading">
                    <div className="admin-spinner"></div>
                </div>
            ) : categoryTree.length === 0 ? (
                <div className="orders-empty">
                    <p>No categories found. Add a new category to get started.</p>
                </div>
            ) : (
                <div className="orders-wrapper">
                    <div style={{ padding: '1rem' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
                            Category Tree Structure
                        </h3>
                        {renderCategoryTree(categoryTree)}
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
                                <label className="filter-label">Parent Category</label>
                                <select
                                    name="parent"
                                    value={formData.parent}
                                    onChange={handleInputChange}
                                    className="filter-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">None (Root Category)</option>
                                    {getParentOptions(editingCategory?._id).map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {'  '.repeat(cat.level || 0)}{cat.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="filter-help">
                                    Select a parent category to create a subcategory, or leave empty for a root category
                                </p>
                            </div>

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
