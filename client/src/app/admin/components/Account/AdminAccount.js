'use client';

import { useRouter } from 'next/navigation';
import StaffAccountSettings from '@/app/components/accounts/StaffAccountSettings';
import { adminAccountApi } from '@/app/utils/adminAccountApi';

export default function AdminAccount() {
  const router = useRouter();

  return (
    <StaffAccountSettings
      api={adminAccountApi}
      title="Admin Account"
      subtitle="Manage your admin profile, password, and security settings."
      onUnauthorized={() => router.push('/admin/signin')}
    />
  );
}