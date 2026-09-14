'use client';

import Link from 'next/link';
import styles from '../../assets/css/auth.module.css';

export default function ResetPasswordMissingTokenPage() {
  return (
    <div className={styles.authCenter}>
      <div className={styles.centerCard}>
        <div className={styles.compactBrand}>
          <Link href="/">Horizon</Link>
        </div>
        <h1 className={styles.title}>Reset link required</h1>
        <p className={styles.subtitle}>
          This page needs a valid reset link from your email. Request a new one if the link is missing or expired.
        </p>
        <p className={styles.loginRedirect}>
          <Link href="/auth/forgotpassword">Request a reset link</Link>
        </p>
        <p className={styles.loginRedirect}>
          <Link href="/auth/signin">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
