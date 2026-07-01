'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminManagementPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin?tab=super-admin');
  }, [router]);

  return null;
}
