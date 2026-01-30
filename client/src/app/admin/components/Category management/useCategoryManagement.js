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
    }
}
   
    }
}