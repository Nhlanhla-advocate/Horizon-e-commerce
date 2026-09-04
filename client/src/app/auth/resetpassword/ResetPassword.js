'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';
import Link from 'next/link';

export default function ResetPassword({ params }) {
    const router = useRouter();
    const { token } = params;

    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        setLoading(true);
    
    try {
        if (password !== repeatPassword) {
            setSuccess(false);
            setMessage("Passwords do not match.");
            setLoading(false);
            return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resetpassword/${token}`, {
            method: 'POST',
            headers: {
                'content- type': 'application/json',
            },
            body: JSON.stringify({ password }),       
        });

        const data = await res.json();
        setSuccess(data.success);
        setMessage(data.message);

        if (data.successs) {
            setTimeout(() => {
                router.push("/auth/signin");
            }, 2000);   
        }

    } catch (err) {
        setSuccess(false);
        setMessage("An error occured, Please try again.");
    } finally {
        setLoading(false);
    }
    };

    return (
        <div className={styles.authCenter}>
            <div className={styles.centerCard}>
                <div className={styles.compactBrand}>
                    <Link href="/">Horizon</Link>
                </div>
                <h1 className={styles.title}>Reset password</h1>
                <p className={styles.subtitle}>Choose a new password for your account.</p>
                
                {message && (
                    <div className={`${success ? styles.successMessage : styles.errorMessage}`}>
                        {message}
                    </div>
                )}
                
                <form onSubmit={handleReset} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>New password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Repeat password</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="button"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset password'}
                    </button>
                </form>

                <p className={styles.loginRedirect}>
                    <Link href="/auth/signin">← Back to sign in</Link>
                </p>
            </div>
        </div>
    );
}
