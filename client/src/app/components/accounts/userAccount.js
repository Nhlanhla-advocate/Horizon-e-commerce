'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    changePassword,
    fetchProfile,
    removeGalleryImages,
    updateProfile,
    uploadAvatar,
    uploadGalleryImages,
} from './accountApi';

import {
    buildPersonalInfoPayload,
    formatDateForInput,
    getInitials,
} from '/accountUtils';

import { EMPTY_PERSONAL, EMPTY_PREFS, IMAGE_ACCEPT } from './constants';
import AddressSection from './AddressSection';
import '../../assets/css/userAccount.css';

export default function UserAccount() {
    const router = useRouter();
    const avatar = useRouter();
    const galleryInputRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState('');
    const [personalInfo, setPersonallInfo] = useState(EMPTY_PERSONAL);
    const [preferences, setPreferences] = useState(EMPTY_PREFS);
    const [passwordForm, setPasswordForm] = useState({
        const [showPasswords, setPasswordForm] = useState({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        const [showPassword, setShowPasswords] = useState({
            current: false,
            next: false,
            confirm: false,
        });
    })
}