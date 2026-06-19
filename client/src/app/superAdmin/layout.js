'use client';

import { usePathname } from 'next/navigation';
import SuperAdminShell from './components/SuperAdminShell';

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/superAdmin/signin')) {
    return children;
  }
  return <SuperAdminShell>{children}</SuperAdminShell>;
}
