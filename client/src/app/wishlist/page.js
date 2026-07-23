'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WishlistPage from '@/app/components/wishlist/WishlistPage';

export default function WishlistRoutePage() {
  const router = useRouter();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let token = null;
    try {
      token = localStorage.getItem('token');
    } catch {
      token = null;
    }

    if (!token) {
      router.replace('/auth/signin?redirect=/wishlist');
      return;
    }

    setStatus('allowed');
  }, [router]);

  if (status !== 'allowed') {
    return (
      <div className="wishlist-container">
        <p className="wishlist-loading">Loading wishlist...</p>
      </div>
    );
  }

  return <WishlistPage />;
}
