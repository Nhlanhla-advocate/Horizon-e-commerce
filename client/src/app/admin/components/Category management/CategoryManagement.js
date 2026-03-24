'use client';

import '../../../assets/css/admin.css';
import '../../../assets/css/productManagement.css';
import { useCategoryManagement } from './useCategoryManagement';
import CategoryFormModal from './CategoryFormModal';

export default function CategoryManagement() {
    const {
        categories,
        loading,
        error,
        success,
        showAddForm,
        editingCategory,
        searchTerm,
        deletingCategoryId,
        formData,
        setSearchTerm,
        setShowAddForm,
        resetForm,
        handleInputChange,
        handleAddCategory,
        handleEditCategory,
        handleDeleteCategory,
        handleEditClick,
        handleFormClose,
    } = useCategoryManagement({ includeHierarchy: false, enableSearch: true });

    return (
        <div className="product-management-container">
            <div className="admin-card" style={{ borderRadius: '0.75rem' }}>
                <div className="product-management-header">
                    <div>
                        <h2 className="product-management-title">Category Management</h2>
                        <p className="product-management-subtitle">Manage product categories and keep your catalog organized.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setShowAddForm(true);
                        }}
                        className="admin-btn admin-btn-primary"
                    >
                        Add Category
                    </button>
                </div>

                {/* Search bar - same layout as Product Management */}
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
                            placeholder="Search categories by name, slug, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="product-management-search-clear"
                                onClick={() => setSearchTerm('')}
                                aria-label="Clear search"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
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
                                    <th className="orders-th">Parent</th>
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
                                            {category.level > 0 && (
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                                                    (Level {category.level || 0})
                                                </span>
                                            )}
                                        </td>
                                        <td className="orders-td">
                                            {category.parent?.name || category.parent ? (
                                                <span style={{ color: '#2563eb' }}>
                                                    {category.parent?.name || 'Unknown'}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Root</span>
                                            )}
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
            <CategoryFormModal
                isOpen={showAddForm}
                onClose={handleFormClose}
                onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
                formData={formData}
                onInputChange={handleInputChange}
                editingCategory={editingCategory}
                categories={categories}
            />
        </div>
    );
}
