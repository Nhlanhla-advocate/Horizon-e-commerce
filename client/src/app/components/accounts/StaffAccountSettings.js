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

const IMAGE_ACCEPT = 'image/jpeg.image/png.image/webp.image/gif';

export default function staffAccountSettings({
    api,
    title = 'My Account',
    subtitle = 'Manage your profile, security, and notification settings.',
    onUnauthorized,
}) {
    const avatarInputRef = useRef(null);

    const [ loading, setLoading ] = useState(true);
    const [ profile, setProfile ] = useState(null);
    const [ username, setUsername ] = useState('');
    const [ personalInfo, setPersonalInfo ] = useState(EMPTY_PERSONAL);
    const [ notifications, setNotifications ] = useState([]);
    const [ loginHistory, setLoginHistory ] = useState([]);
    const [ passwordForm, setPasswordForm ] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [twoFactor, setTwoFactor] = useState(null);
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [disableTwoFactor, setDisableTwoFactor] = useState({ currentPassword: '', token: '' });

    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [notifSaving, setNotifSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [twoFactorSaving, setTwoFactorSaving] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const applyProfile = useCallback((admin) => {
        setProfile(admin);
        setUsername(admin.username || '');
        setPersonalInfo({ ...EMPTY_PERSONAL, ...admin.personalInfo });
        setNotifications({ ...admin.notificationPreferences });
    }, []);
}