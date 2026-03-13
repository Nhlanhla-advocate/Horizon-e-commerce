'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SuperAdminSignin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkSuperAdminAuth = async () => {
            const adminToken = localStorage.getItem('adminToken');
            if (!adminToken) return;

            try {
                const response = await fetch( `${API_BASE}/admin/Profile`, {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const role = data.admin?.role || data.role;
                    if (data.success && role === 'super_admin') {
                        router.push('/superAdmin/management');
                        return;
                    }
                }
                localStorage.removeItem('adminToken');
                localStorage.removeItem('token');
            } catch {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('token');
            }
        };

        checkSuperAdminAuth();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch( `${API_BASE}/admin/signin`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            let data;
            try {
                data = await response.json();
            } catch {
                setError('invalid response from server. Please try again.');
                setLoading(false);
                return;
            }

            const token = data.accessToken || data.token;
            if (!response.ok || !data.success || !token) {
                setError(data.error || data.message || 'Invalid credentials.');
                setLoading(false);
                return;
            }

            const role = data.role || data.admin?.role;
            if (role !== 'super_admin') {
                setError('Access denied.Super admin sign-in only. Use the admin portal for staff accounts.');
                setLoading(false);
                return;
            }

            localStorage.clear();
            localStorage.setItem('adminToken', token);
            localStorage.setItem('token', token);
            localStorage.setItem('adminRole', 'super_admin');

            await new Promise((r) => setTimeout(r, 300));
            window.location.href = '/superAdmin/management';
        } catch (err) {
            console.error('Super admin login error:', err);
            setError(err.message || 'Server error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPageWrapper}>
            <div className={styles.authSplit}>
                <div className={styles.mediaPane}>
                    <div className={styles.mediaImageWrapper}>
                        <img src ="/Pictures/Playstation 5 pro.jpg" alt="Super Admin" className={styles.mediaImage} />
                        <div className={styles.mediaOverlay}>
                            <h2 className={styles.mediaTitle}>Super Admin</h2>
                            <p className={styles.mediaSubtitle}>Restricted access</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}