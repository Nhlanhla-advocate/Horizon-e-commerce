'use client';

import { useState, useEffect } from 'react';
import '../../assets/css/superAdmin.css';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ROLES = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'support', label: 'Support' },
];

const PERMISSION_OPTIONS = [
    'manage_products',
    'manage_orders',
    'view_users',
    'manage_users',
    'handle_refunds',
    'manage_admins',
    'view_audit_logs',
    'view_system_activity',
    'view_failed_payments',
    'suspend_ban_users',
    'override_orders',
];

