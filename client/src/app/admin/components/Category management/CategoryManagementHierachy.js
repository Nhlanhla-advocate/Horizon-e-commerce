'use client';

import { useState } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/categoryManagementHierachy.css';
import { useCategoryManagement } from './useCategoryManagement';
import CategoryFormModal from './CategoryFormModal';

export default function CategoryManagementHierarchy() {
    const {
        categories,
        categoryTree,
        loading,
        error,
        success,
        showAddForm,
        editingCategory,
        deletingCategoryId,
        formData,
        setShowAddForm,
        resetForm,
        handleInputChange,
        handleAddCategory,
        handleEditCategory,
        handleDeleteCategory,
        handleEditClick,
        handleFormClose,
    } = useCategoryManagement({ includeHierarchy: true, enableSearch: false });

    // Toggle expand/collapse (hierarchy-specific)
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    
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

    // Get all parent options (excluding current category and its descendants)
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

    //Render category tree
    const renderCategoryTree = (tree, level = 0) => {
        return tree.map(category => {
            const hasChildren = category.children && category.children.length > 0;
            const isExpanded = expandedCategories.has(category._id.toString());
            const indent = level * 24;

            return (
                <div key={category._id} className="category-tree-item" style={{ marginLeft: `${indent}px` }}>
                    <div 
                        className={`category-tree-item-wrapper ${level % 2 !== 0 ? 'level-odd' : ''}`}
                    >
                        <div className="category-tree-item-content">
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(category._id.toString())}
                                    className="category-expand-button"
                                >
                                    {isExpanded ? '▼' : '▶'}
                                </button>
                            ) : (
                                <span className="category-expand-spacer"></span>
                            )}
                            
                            <div className="category-info">
                                <div className="category-info-header">
                                    <strong className="category-name">{category.name}</strong>
                                    {category.parent && (
                                        <span className="category-parent-label">
                                            (Child of: {category.parent.name || 'Unknown'})
                                        </span>
                                    )}
                                    <span className={`category-status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {category.description && (
                                    <p className="category-description">
                                        {category.description}
                                    </p>
                                )}
                                <p className="category-meta">
                                    Slug: <span className="mono-text">{category.slug}</span> | 
                                    Level: {category.level || 0} | 
                                    Path: <span className="mono-text">{category.path || category.slug}</span>
                                </p>
                            </div>
                            
                            <div className="category-actions">
                                <button
                                    onClick={() => handleEditClick(category)}
                                    className="admin-btn admin-btn-secondary category-action-button"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteCategory(category._id)}
                                    disabled={deletingCategoryId === category._id}
                                    className="admin-btn category-action-button category-delete-button"
                                >
                                    {deletingCategoryId === category._id ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {hasChildren && isExpanded && (
                        <div className="category-children">
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
                    <div className="category-hierarchy-tree">
                        <h3 className="category-hierarchy-title">
                            Category Tree Structure
                        </h3>
                        {renderCategoryTree(categoryTree)}
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
                getParentOptions={getParentOptions}
            />
        </div>
    );
}
