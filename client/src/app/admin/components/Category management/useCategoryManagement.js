'use client';

import { useState, useEffect, useCallback } from 'react';

// Use same origin so Next.js rewrites /admin/* to the backend (avoids CORS and ensures categories are fetched)
const getBaseUrl = () => (typeof window !== 'undefined' ? '' : 'http://localhost:5000');

export function useCategoryManagement({ includeHierarchy = false, enableSearch = true } = {}) {
    const [categories, setCategories] = useState([]);
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingCategoryId, setDeletingCategoryId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        parent: '',
    });

    //Helper function to generate slug from name
    const generateSlug = (name) => {
        return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    //Helper function to build category tree
    const buildCategoryTree = (categoriesList, parentId = null) => {
        return categoriesList
        .filter(cat => {
            if (parentId === null) return !cat.parent;
            return cat.parent && cat.parent.toString() === parentId.toString();
        })
        .map(cat => ({
            ...cat,
            children: buildCategoryTree(categoriesList, cat._id)
        }));
    };

    //Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (!token) {
                setError('Please sign in to load categories.');
                setLoading(false);
                return;
            }

            const queryParams = new URLSearchParams();

            if (includeHierarchy) {
                queryParams.append('hierarchy', 'true');
            }

            if (enableSearch && searchTerm.trim()) {
                queryParams.append('search', searchTerm.trim());
            }

            const baseUrl = getBaseUrl();
            const url = `${baseUrl}/admin/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch categories');
            }

            const contentType = response.headers.get('content-type');
            const data = contentType && contentType.includes('application/json')
                ? await response.json()
                : {};

            const list = Array.isArray(data.categories) ? data.categories : [];
            if (response.ok && !contentType?.includes('application/json')) {
                setError('Server did not return a valid response. Please try again.');
            }

            if (includeHierarchy && Array.isArray(data.categories)) {
                setCategoryTree(data.categories);
                setCategories(Array.isArray(data.flat) ? data.flat : list);
            } else {
                setCategories(list);
                if (includeHierarchy) {
                    setCategoryTree(buildCategoryTree(list));
                }
            }
        } catch (err) {
            console.error('Error fetching categories', err);
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, [includeHierarchy, enableSearch, searchTerm]);

        //Fetch categories on mount and when dependencies change
        useEffect(() => {
            fetchCategories();
        },[fetchCategories]);

        //Reset form
        const resetForm = () => {
            setFormData({
                name: '',
                slug: '',
                description: '',
                parent: ''
            });
            setEditingCategory(null);
            setError(null);
            setSuccess(null);
        };

        //Handle input change
        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            //Auto-generaate slug from name if slug is empty or matches the old name
            if (name === 'name' && (!formData.slug || formData.slug === generateSlug(editingCategory?.name || ''))) {
                setFormData(prev => ({
                    ...prev,
                    slug: generateSlug(value)
                }));
            }
        };

        //Handle add category
        const handleAddCategory = async (e) => {
            e.preventDefault();

            try {
                setError(null);
                setSuccess(null);

                const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

                    const categoryData = {
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        slug: formData.slug.trim() || generateSlug(formData.name),
                        parent: formData.parent || null
                    };

                    const response = await fetch(`${getBaseUrl()}/admin/categories`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(categoryData)
                    });

                    const data = await response.json().catch(() => ({}));

                    if (!response.ok) {
                        throw new Error(data.message || response.statusText || 'Failed to create category');
                    }

                    setSuccess(data.message || 'Category created successfully');
                    resetForm();
                    setShowAddForm(false);

                    //Refresh categories
                    await fetchCategories();

                    //Clear success message after 3 seconds
                    setTimeout(() => setSuccess(null), 3000);
                } catch (err) {
                    setError(err.message || 'Failed to create category');
                    console.error('Error creating category', err);
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
                const categoryData = {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    slug: formData.slug.trim() || generateSlug(formData.name),
                    parent: formData.parent || null
                };

                const response = await fetch(`${getBaseUrl()}/admin/categories/${editingCategory._id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(categoryData)
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    throw new Error(data.message || response.statusText || 'Failed to update category');
                }

                setSuccess(data.message || 'Category updated successfully');
                resetForm();
                setShowAddForm(false);
                await fetchCategories();
                setTimeout(() => setSuccess(null), 3000);
            } catch (err) {
                console.error('Error updating category', err);
                setError(err.message || 'Failed to update category');
            }
        };

            //Handle delete category
            const handleDeleteCategory = async (categoryId) => {
                if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                    return;
                }

                try {
                    setError(null);
                    setSuccess(null);
                    setDeletingCategoryId(categoryId);

                    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');

                    const response = await fetch(`${getBaseUrl()}/admin/categories/${categoryId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const data = await response.json().catch(() => ({}));

                    if (!response.ok) {
                        throw new Error(data.message || response.statusText || 'Failed to delete category');
                    }

                    setSuccess(data.message || 'Category deleted successfully');

                    //Refresh categories
                    await fetchCategories();

                    //Clear success message after 3 seconds
                    setTimeout(() => setSuccess(null), 3000);
                } catch (err) {
                    console.error('Error deleting category', err);
                    setError(err.message || 'Failed to delete category');
                } finally {
                    setDeletingCategoryId(null);
                }
            };

            //Handle edit click
            const handleEditClick = (category) => {
                setEditingCategory(category);
                setFormData({
                    name: category.name || '',
                    slug: category.slug || '',
                    description: category.description || '',
                    parent: category.parent?._id?.toString() || category.parent?.toString() || ''
                });
                setShowAddForm(true);
                setError(null);
                setSuccess(null);
            };

            //Handle form close
            const handleFormClose = () => {
                resetForm();
                setShowAddForm(false);
            };

            return {
                categories,
                categoryTree,
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
            };
    }