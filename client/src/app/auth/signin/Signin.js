'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';
import Link from 'next/link';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Clear form on mount
        const clearForm = () => {
            setEmail('');
            setPassword('');
            setShowPassword(false);
            setError(null);
        };

        clearForm();
        window.addEventListener('load', clearForm);

        return () => {
            window.removeEventListener('load', clearForm);
        };
    }, []);

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
            // User login
            console.log("Attempting user login:", "http://localhost:5000/auth/signin");
            
            const response = await fetch("http://localhost:5000/auth/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
                credentials: "include"
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error("Failed to parse user login response:", jsonError);
                setError("Invalid response from server. Please try again.");
                setLoading(false);
                return;
            }
            
            console.log("User login response status:", response.status);
            console.log("User login response data:", data);
            
            if (response.ok) {
                console.log("User signed in successfully.", data);
                localStorage.setItem("token", data.accessToken || data.token); 
                router.push("/");
                return;
            }
            
            // Check if this is an admin trying to use user signin
            if (response.status === 403 && data.error && data.error.includes("admin")) {
                setError("This email is registered as an admin. Redirecting to admin sign-in...");
                // Redirect to admin signin after a short delay
                setTimeout(() => {
                    router.push("/admin/signin");
                }, 2000);
                setLoading(false);
                return;
            }
            
            // Login failed
            setError(data.error || data.message || "Invalid credentials. Please try again.");
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
                        <p className={styles.subtitle} style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.9rem' }}>
                            Welcome back! Please sign in to your account.
                        </p>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="email">Email</label>
                                <input
                                    className={styles.input}
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
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
                                <Link href="/auth/forgotpassword" className={styles.forgotPassword}>
                                    Forgot Password?
                                </Link>
                                <p className={styles.signupRedirect}>
                                    If you don't have an account, <Link href="/auth/signup">sign up</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;


