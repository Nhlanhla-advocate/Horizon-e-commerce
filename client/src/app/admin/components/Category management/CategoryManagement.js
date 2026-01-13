'use client';

import { useState, useEffect} from 'react';
import '../../../assets/css/admin.css';

//Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddform] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
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

            const response = awaitfetch(`${BASE_URL}/admin/categories?${queryParams}`, {
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
        setFormData ({
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

            //Auto-generate slug from nameif slug is empty or matches old name
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
                throw new Error('Authenticate required');
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

                body:JSON.stringify(categoryData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to add category');
            }
        
            setSuccess('Category added successfully!');
            await fetchCategories();
            setShowAddform(false)
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
                throw new Error ('Authentication required');
            }

            //Generate slug if not provided
            const categoryData = {
                ...formData,
                slug: formData.slug || generateSlug(formData.name)
            };

            const response = await fetch(`$(BASE_URL)/admin/categories/$(editingCategory._id)`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer $(token)`,
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
            setShowAddform(false);
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

            const response = await fetch(`$(BASE_URL)/admin/categories/$(categoryId)`, {
                method: 'DELETE',
                headers: {
                    Authorizations: `Bearer $(token)`,
                    'content-Type': 'application/json',
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
        setShowAddform(true);
        setError(null);
        setSuccess(null)
      };

      

         


    }
}