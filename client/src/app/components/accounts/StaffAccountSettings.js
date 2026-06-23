'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buildPersonalInfoPayload } from './accountUtils';
import '../../assets/css/adminAccount.css';

const EMPTY_PERSONAL = { 
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    bio: '',
};

const NOTIFICATION_KEYS = [
    { key: 'orderAlerts', label: 'Order Alerts' },
    { key: 'stockAlerts', label: 'Stock Alerts' },
    { key: 'reviewAlerts', label: 'Review Alerts' },
    { key: 'securityAlerts', label: 'Security Alerts' },
    { key: 'weeklyReports', label: 'Weekly Reports' },
];

