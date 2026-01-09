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
}