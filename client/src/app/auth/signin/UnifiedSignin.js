'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';
import Link from 'next/link';

const UnifiedSignin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState('user'); // 'user' or 'admin'
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
    
        if (!email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        const loginData = { email, password };
    
        try {
            // Try the selected signin type first
            const endpoint = userType === 'admin' 
                ? "http://localhost:5000/admin/signin"
                : "http://localhost:5000/auth/signin";
            
            console.log(`Attempting ${userType} login:`, endpoint);
            
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
                credentials: "include"
            });
        
            const data = await response.json();
            console.log(`${userType} login response:`, data);
        
            if (response.ok && data.success) {
                if (userType === 'admin') {
                    // Admin login
                    localStorage.setItem("adminToken", data.token);
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("adminRole", data.role || "admin");
                    router.push("/admin");
                } else {
                    // User login
                    localStorage.setItem("token", data.accessToken || data.token);
                    router.push("/");
                }
            } else {
                // If login fails, suggest trying the other type
                if (userType === 'user' && response.status === 404) {
                    setError(`User not found. Are you an admin? Try switching to Admin login.`);
                } else if (userType === 'admin' && response.status === 404) {
                    setError(`Admin not found. Are you a regular user? Try switching to User login.`);
                } else {
                    setError(data.error || data.message || "Invalid credentials. Please try again.");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(`Server error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authPageWrapper}>
            <div className={styles.authSplit}>
                <div className={styles.mediaPane}>
                    <div className={styles.mediaImageWrapper}>
                        <img src="/Pictures/Playstation 5 pro.jpg" alt="Promo" className={styles.mediaImage} />
                        <div className={styles.mediaOverlay}>
                            <h2 className={styles.mediaTitle}>Solar Vision</h2>
                            <p className={styles.mediaSubtitle}>See the Sun, Own the Style</p>
                        </div>
                    </div>
                </div>

                <div className={styles.formPane}>
                    <div className={styles.container}>
                        <h2 className={styles.title}>Sign In</h2>
                        
                        {/* User Type Toggle */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '0.5rem', 
                            marginBottom: '1.5rem',
                            padding: '0.25rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '0.5rem'
                        }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setUserType('user');
                                    setError(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: userType === 'user' ? '600' : '400',
                                    backgroundColor: userType === 'user' ? '#fff' : 'transparent',
                                    color: userType === 'user' ? '#000' : '#6b7280',
                                    boxShadow: userType === 'user' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setUserType('admin');
                                    setError(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: userType === 'admin' ? '600' : '400',
                                    backgroundColor: userType === 'admin' ? '#fff' : 'transparent',
                                    color: userType === 'admin' ? '#000' : '#6b7280',
                                    boxShadow: userType === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Admin
                            </button>
                        </div>

                        {error && <div className={styles.errorMessage}>{error}</div>}
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="email">Email</label>
                                <input
                                    className={styles.input}
                                    id="email"
                                    type="email"
                                    placeholder={`Enter ${userType === 'admin' ? 'admin' : 'your'} email`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="password">Password</label>
                                <div className={styles.passwordInputContainer}>
                                    <input
                                        className={styles.input}
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
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
                                {loading ? "Signing in..." : "Sign In"} 
                            </button>
                            <div className={styles.authLinks}>
                                {userType === 'user' && (
                                    <>
                                        <Link href="/auth/forgotpassword" className={styles.forgotPassword}>
                                            Forgot Password?
                                        </Link>
                                        <p className={styles.signupRedirect}>
                                            If you don't have an account, <Link href="/auth/signup">sign up</Link>
                                        </p>
                                    </>
                                )}
                                {userType === 'admin' && (
                                    <p className={styles.signupRedirect} style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                                        <a href="/" style={{ color: '#666', textDecoration: 'none' }}>
                                            ← Back to Store
                                        </a>
                                    </p>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedSignin;






