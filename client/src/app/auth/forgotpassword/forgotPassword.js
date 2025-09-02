'use client';

import { useState } from 'react';
import styles from '../../assets/css/auth.module.css';
import '../../assets/css/buttons.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || `If an account exists, a reset email was sent to ${email}.`);
        setEmail('');
      } else if (response.status === 400) {
        const msg = data.errors?.map?.((e) => e.msg).join(', ') || data.message || 'Invalid input';
        setError(msg);
      } else if (response.status === 404) {
        setError('No account found with that email.');
      } else {
        setError(data.message || data.error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authCenter}>
      <div className={styles.container}>
        <h2 className={styles.title}>Forgot Password</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;