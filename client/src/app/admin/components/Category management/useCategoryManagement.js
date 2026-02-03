'use client';

import { useState, useEffect } from 'react';

//Backend base Url
const BASE_URL = 'http://localhost:5000';

export function useCategoryManagement({ includeHierachy = false, enableSearch = true } = {}) {
    const [categories, setCategories] = useState([]);
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
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
    const fetchCategories = useCallback(async() =>{
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            if (includeHierachy) {
                queryParams.append('hierarchy', 'true');
            }

            if (enableSearch && searchTerm.trim()) {
                queryParams.append('search', searchTerm.trim());
            }

            const url = `${BASE_URL}/dashboard/categories?${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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

            const data = await response.json();

            if (includeHierachy && data.categories) {
                //if hierarchy is requested, use the tree structure
                setCategoryTree(data.categories);
                setCategories(data.flat || []);
            } else {
                //Flat list
                setCategories(data.categories || []);
                if (includeHierachy) {
                    setCategoryTree(buildCategoryTree(data.categories || []));
                }
            }
            } catch (err) {
                console.error('Error fetching categories', err);
                setError(err.message || 'Failed to fetch categories');
            } finally {
                setLoading(false);
            }

        },[includeHierarchy, enableSearch, searchTerm]);

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
            if (name === 'name' && (!formData.slug || formData.slug === generateSllug(editingCategory?.name || ''))) {
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

                const token = localStorage.getItem('adminToken') || localStorage.getItem('token';

                    const categoryData = {
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        slug: formData.slug.trim() || generateSlug(formData.name),
                        parent: formData.parent || null
                    };

                    const response = await fetch(`${BASE_URL}/dashboard/categories`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(categoryData)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to create category');
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

                    const response = await fetch(`${BASE_URL}/dashboard/categories/${categoryId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                }
            }
        }
    }
}