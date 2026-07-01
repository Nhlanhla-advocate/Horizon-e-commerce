import { Suspense } from 'react';
import AdminDashboard from './adminDashboard';

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  );
}

