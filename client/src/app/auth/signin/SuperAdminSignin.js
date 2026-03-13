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
                const response = await fetch(`${API_BASE}/admin/profile`, {
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
            const response = await fetch(`${API_BASE}/admin/signin`, {
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
                        <img src="/Pictures/Playstation 5 pro.jpg" alt="Super Admin" className={styles.mediaImage} />
                        <div className={styles.mediaOverlay}>
                            <h2 className={styles.mediaTitle}>Super Admin</h2>
                            <p className={styles.mediaSubtitle}>Restricted access</p>
                        </div>
                    </div>
                </div>

                <div className={styles.formPane}>
                    <div className={styles.container}>
                        <h2 className={styles.title}>Super Admin Sign In</h2>
                        <p className={styles.subtitleMuted}>Sign in with a super_admin account only</p>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="super-admin-email">Email</label>
                                <input
                                    className={styles.input}
                                    id="super-admin-email"
                                    type="email"
                                    placeholder="Super admin email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="super-admin-password">Password</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        className={styles.input}
                                        id="super-admin-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94288 16.4788 5 12.0012 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.7302 5.07319C11.1448 5.02485 11.5684 5 11.9999 5C16.6639 5 20.3998 7.90264 21.6997 12C21.3957 12.9217 20.8589 13.7533 20.1471 14.4196M6.52026 6.51944C4.47949 7.76406 2.90205 9.69259 2.30011 12C3.60002 16.0974 7.33588 19 12.0001 19C14.037 19 15.8979 18.446 17.4805 17.4804M9.87871 9.87859C9.33576 10.4215 9.00012 11.1715 9.00012 12C9.00012 13.6569 10.3433 15 12.0001 15C12.8286 15 13.5785 14.6644 14.1215 14.1214" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <button className="button" type="submit" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                            <div className={`${styles.authLinks} ${styles.authLinksBlock}`}>
                                <p className={`${styles.signupRedirect} ${styles.authLinksCenter}`}>
                                    <Link href="/admin/signin" className={styles.authLinkSecondarySpaced}>
                                        Admin sign in
                                    </Link>
                                    <Link href="/" className={styles.authLinkSecondary}>
                                        ← Back to Store
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}