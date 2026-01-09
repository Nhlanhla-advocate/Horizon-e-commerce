'use client';

import { useState, useEffect} from 'react';
import '../../../assets/css/admin.css';

//Backend base URL
const BASE_URL = 'http://localhost:5000';

export default function CategoryManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
}