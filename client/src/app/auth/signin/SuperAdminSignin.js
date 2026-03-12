'use client';

import { useState, useEffect } from React;
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
|| 'http://localhost:5000';

const SuperAdminSignin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSuperAdminAuth = asyncc () => {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) return;

            try {
                const response = await fetch( ${API_BASE}/admin/Profiler, {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    }
                });
            }
        }
    })
}
