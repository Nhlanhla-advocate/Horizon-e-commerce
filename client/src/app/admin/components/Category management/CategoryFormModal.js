'use client';

export default function CategoryFormModal({
    isOpen,
    onClose,
    onSubmit,
    formData,
    onInputChange,
    editingCategory,
    categories,
    getParentOptions
}) {
    if (!isOpen) return null;

    return (
        <div
            className="admin-modal-overlay"
            onClick={onClose}
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
                    <div style={{ marginBottom: '1.5rem', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600'}}>
                            {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </h3>
                        <button 
                             onClick={onClose}
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

                    <form onSubmit={onSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="filter-label">Parent Category</label>
                            <select 
                                name="parent"
                                value={formData.parent}
                                onChange={onInputChange}
                                className="filter-select"
                                style={{ width: '100%' }}
                            >

                                <option value="">None (Root Category)</option>
                                {getParentOptions
                                    ? getParentOptions(editingCategory?._id).map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {'  '.repeat(cat.level || 0)}{cat.name}
                                        </option>
                                    ))
                                    : categories
                                        .filter(cat => !editingCategory || cat._id.toString() !== editingCategory._id.toString())
                                        .map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {'  '.repeat(cat.level || 0)}{cat.name}
                                            </option>
                                        ))
                                }
                            </select>

                            <p className="filter-help">
                                Select a parent category to create a subcategory, or leave empty for a root category.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="filter-label">Category Name *</label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={onInputChange}
                                className="filter-input"
                                required
                                placeholder="Enter category name"
                                style={{ width: '100%' }}
                            />
                            <p className="filter-help">URL-friendly identifier (auto-generated if left empty)</p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="filter-label">Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={onInputChange}
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
                                onChange={onInputChange}
                                className="filter-input"
                                rows="4"
                                placeholder="Enter category description..."
                                style={{ width:'100%', resize: 'vertical' }}
                                />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button 
                                type="button"
                                onClick={onClose}
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
    );
}