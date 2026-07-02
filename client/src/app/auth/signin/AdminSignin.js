'use client';

import { useState, useEffect } from 'react';
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';
import Link from 'next/link';
import { getLoginIpPayload } from '../../utils/clientIp';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AdminSignin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('credentials');
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [totpCode, setTotpCode] = useState('');

    useEffect(() => {
        // Always allow account switching from admin sign-in page.
        // Clearing existing admin tokens here prevents stale sidebar identity.
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('adminRole');
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const completeAdminSignIn = async (data) => {
        const token = data.accessToken || data.token;
        if (!token) {
            setError('Sign-in succeeded but no token was returned. Please try again.');
            return;
        }

        localStorage.clear();
        localStorage.setItem('adminToken', token);
        localStorage.setItem('token', token);
        localStorage.setItem('adminRole', data.role || 'admin');

        await new Promise((resolve) => setTimeout(resolve, 300));

        const finalCheck = localStorage.getItem('adminToken');
        if (!finalCheck) {
            localStorage.setItem('adminToken', token);
            localStorage.setItem('token', token);
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        window.location.href = '/admin';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email || !password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const adminData = { email, password };
        const ipPayload = await getLoginIpPayload();

        try {
            const response = await fetch(`${API_BASE}/admin/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...ipPayload.headers,
                },
                body: JSON.stringify({ ...adminData, ...ipPayload.body }),
                credentials: 'include',
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse admin login response:', jsonError);
                setError('Invalid response from server. Please try again.');
                setLoading(false);
                return;
            }

            if (response.ok && data?.success && data.requiresTwoFactor && data.twoFactorToken) {
                setTwoFactorToken(data.twoFactorToken);
                setTotpCode('');
                setStep('twoFactor');
                return;
            }

            const token = data.accessToken || data.token;
            if (response.ok && data?.success === true && token) {
                await completeAdminSignIn(data);
                return;
            }

            setError(data.error || data.message || 'Invalid admin credentials. Please try again.');
        } catch (err) {
            console.error('Admin login error:', err);
            setError(`Server error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTwoFactorSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!totpCode || totpCode.length !== 6) {
            setError('Enter the 6-digit code from your authenticator app.');
            setLoading(false);
            return;
        }

        const ipPayload = await getLoginIpPayload();

        try {
            const response = await fetch(`${API_BASE}/admin/signin/2fa`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...ipPayload.headers,
                },
                body: JSON.stringify({
                    twoFactorToken,
                    token: totpCode,
                    ...ipPayload.body,
                }),
                credentials: 'include',
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse 2FA response:', jsonError);
                setError('Invalid response from server. Please try again.');
                setLoading(false);
                return;
            }

            const token = data.accessToken || data.token;
            if (response.ok && data?.success === true && token) {
                await completeAdminSignIn(data);
                return;
            }

            if (response.status === 401) {
                setStep('credentials');
                setTwoFactorToken('');
                setTotpCode('');
            }

            setError(data.error || data.message || 'Invalid verification code. Please try again.');
        } catch (err) {
            console.error('Admin 2FA error:', err);
            setError(`Server error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToCredentials = () => {
        setStep('credentials');
        setTwoFactorToken('');
        setTotpCode('');
        setError(null);
    };

    return (
        <div className={styles.authPageWrapper}>
            <div className={styles.authSplit}>
                <div className={styles.mediaPane}>
                    <div className={styles.mediaImageWrapper}>
                        <img src="/Pictures/Playstation 5 pro.jpg" alt="Admin Access" className={styles.mediaImage} />
                        <div className={styles.mediaOverlay}>
                            <h2 className={styles.mediaTitle}>Admin Portal</h2>
                            <p className={styles.mediaSubtitle}>Secure Admin Access</p>
                        </div>
                    </div>
                </div>

                <div className={styles.formPane}>
                    <div className={styles.container}>
                        <h2 className={styles.title}>
                            {step === 'twoFactor' ? 'Two-Factor Authentication' : 'Admin Sign In'}
                        </h2>
                        <p className={styles.subtitle} style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                            {step === 'twoFactor'
                                ? 'Enter the 6-digit code from your authenticator app.'
                                : 'Access your admin dashboard'}
                        </p>
                        {error && <div className={styles.errorMessage}>{error}</div>}

                        {step === 'credentials' ? (
                            <form className={styles.form} onSubmit={handleSubmit}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} htmlFor="admin-email">Email</label>
                                    <input
                                        className={styles.input}
                                        id="admin-email"
                                        type="email"
                                        placeholder="Enter admin email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} htmlFor="admin-password">Password</label>
                                    <div className={styles.passwordInputContainer}>
                                        <input
                                            className={styles.input}
                                            id="admin-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter admin password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.passwordToggle}
                                            onClick={togglePasswordVisibility}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94288 16.4788 5 12.0012 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10.7302 5.07319C11.1448 5.02485 11.5684 5 11.9999 5C16.6639 5 20.3998 7.90264 21.6997 12C21.3957 12.9217 20.8589 13.7533 20.1471 14.4196M6.52026 6.51944C4.47949 7.76406 2.90205 9.69259 2.30011 12C3.60002 16.0974 7.33588 19 12.0001 19C14.037 19 15.8979 18.446 17.4805 17.4804M9.87871 9.87859C9.33576 10.4215 9.00012 11.1715 9.00012 12C9.00012 13.6569 10.3433 15 12.0001 15C12.8286 15 13.5785 14.6644 14.1215 14.1214" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <button className="button" type="submit" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                                <div className={styles.authLinks} style={{ marginTop: '1rem' }}>
                                    <p className={styles.signupRedirect} style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                                        <Link href="/" style={{ color: '#666', textDecoration: 'none' }}>
                                            ← Back to Store
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        ) : (
                            <form className={styles.form} onSubmit={handleTwoFactorSubmit}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} htmlFor="admin-2fa-code">Authenticator code</label>
                                    <input
                                        className={styles.input}
                                        id="admin-2fa-code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={totpCode}
                                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                </div>
                                <button className="button" type="submit" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify and sign in'}
                                </button>
                                <div className={styles.authLinks} style={{ marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        className={styles.forgotPassword}
                                        onClick={handleBackToCredentials}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        ← Back to sign in
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSignin;
