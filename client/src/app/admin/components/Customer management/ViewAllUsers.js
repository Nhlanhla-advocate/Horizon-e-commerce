'use client';

import { useState, useEffect, useCallback } from 'react';
import '../../../assets/css/admin.css';
import '../../../assets/css/userManagement.css';

const getBaseUrl = () => (
    typeof window !== 'undefined' ? '' : 'http://localhost:5000');

    export default function ViewAllUsers() {
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [searchTerm, setSearchTerm] = useState('');
        const [roleFilter, setRoleFilter] = useState('');
        const [statusFilter, setStatusFilter] = useState('');
    }