'use client';

import { useRouter } from 'next/navigation';
import StaffAccountSettings from '@/app/components/accounts/StaffAccountSettings';
import { superAdminAccountApi } from '@/app/utils/adminAccountApi';

export default function SuperAdminAccountPage() {
  const router = useRouter();

  return (
    <StaffAccountSettings
      api={superAdminAccountApi}
      title="Super Admin Account"
      subtitle="Manage your super admin profile, password, notifications, and security settings."
      onUnauthorized={() => router.replace('/superAdmin/signin')}
    />
  );
}
