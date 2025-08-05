import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../app/Styles/auth.module.css';
import Link from 'next/link';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        const userData = { email, password };

        try {
            const response = await fetch("http://localhost:3000/user/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("You have been signed in successfully.", data);
                localStorage.setItem("token", data.token);
                router.push("/");
            } else {
                setError(data.message || "An error occurred, please try again.");
            }
        } catch (error) {
            setError("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Sign In</h2>
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
                    <input
                        className={styles.input}
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className={styles.button} type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"} 
                </button>
                <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                    Forgot Password?
                </Link>
            </form>
        </div>
    );
};

export default Signin;

