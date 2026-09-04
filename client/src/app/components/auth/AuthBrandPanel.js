'use client';

import Link from 'next/link';
import styles from '../../assets/css/auth.module.css';

const DEFAULT_POINTS = [
  'Track orders from your account',
  'Save your cart across devices',
  'Checkout securely',
];

export default function AuthBrandPanel({
  kicker = 'Horizon',
  title,
  subtitle,
  points = DEFAULT_POINTS,
}) {
  return (
    <aside className={styles.mediaPane} aria-label="Horizon">
      <div className={styles.brandPanel}>
        <Link href="/" className={styles.brandLogo}>
          {kicker}
        </Link>
        <div>
          <p className={styles.brandEyebrow}>Account</p>
          <h2 className={styles.mediaTitle}>{title}</h2>
          <p className={styles.mediaSubtitle}>{subtitle}</p>
          {Array.isArray(points) && points.length > 0 && (
            <ul className={styles.brandPoints}>
              {points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </div>
        <Link href="/" className={styles.brandHomeLink}>
          ← Back to store
        </Link>
      </div>
    </aside>
  );
}
