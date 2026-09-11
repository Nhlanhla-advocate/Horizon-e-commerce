'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';
import { getUserApiBaseUrl } from '@/app/utils/userAuthFetch';

export default function ResetPassword() {
  const router = useRouter();
  const params = useParams();
  const token = typeof params?.token === 'string' ? params.token : '';

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSuccess(null);

    try {
      if (!token) {
        setSuccess(false);
        setMessage('This reset link is invalid. Please request a new one.');
        return;
      }

      if (password !== repeatPassword) {
        setSuccess(false);
        setMessage('Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        setSuccess(false);
        setMessage('Password must be at least 6 characters long.');
        return;
      }

      const apiBase = getUserApiBaseUrl().replace(/\/$/, '');
      const res = await fetch(`${apiBase}/auth/reset-password/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
          confirmPassword: repeatPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const ok = res.ok && data.success === true;
      const validationMsg = Array.isArray(data.errors)
        ? data.errors.map((err) => err.msg).filter(Boolean).join(', ')
        : '';
      setSuccess(ok);
      setMessage(
        data.message ||
          validationMsg ||
          (ok ? 'Password reset successful' : 'Could not reset password')
      );

      if (ok) {
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
    } catch {
      setSuccess(false);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.authCenter}>
        <div className={styles.centerCard}>
          <div className={styles.compactBrand}>
            <Link href="/">Horizon</Link>
          </div>
          <h1 className={styles.title}>Invalid reset link</h1>
          <p className={styles.subtitle}>
            This reset link is missing or incomplete. Request a new one from the forgot password page.
          </p>
          <p className={styles.loginRedirect}>
            <Link href="/auth/forgotpassword">Request a reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authCenter}>
      <div className={styles.centerCard}>
        <div className={styles.compactBrand}>
          <Link href="/">Horizon</Link>
        </div>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>Choose a new password for your account.</p>

        {message && (
          <div className={success ? styles.successMessage : styles.errorMessage}>
            {message}
          </div>
        )}

        <form onSubmit={handleReset} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="repeat-password">Repeat password</label>
            <input
              id="repeat-password"
              type="password"
              className={styles.input}
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="button" disabled={loading}>
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
