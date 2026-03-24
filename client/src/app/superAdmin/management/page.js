'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Manage from './Manage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SuperAdminManagementPage() {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.replace('/superAdmin/signin');
            return;
        }
        (async () => {
            try {
                const res = await fetch(`${API_BASE}/admin/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    router.replace('/superAdmin/signin');
                    return;
                }
                const data = await res.json();
                const role = data.admin?.role || data.role;
                if (role !== 'super_admin') {
                    router.replace('/admin');
                }
            } catch {
                router.replace('/superAdmin/signin');
            }
        })();
    }, [router]);

    return <Manage />;
}
