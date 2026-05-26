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

        const [profileSaving, setProfileSaving] = useState(false);
        const [passwordSaving, setPasswordSaving] = useState(false);
        const [prefSaving, setPrefsSaving] = useState(false);
        const [avatarUploading, setAvatarUploading] = useState(false);
        const [galleryUploading, setGalleryUploading] = useState(false);

        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        const applyProfile = useCallback((user) => {
            setProfile(user);
            setUsername(user.username || '');
            setPersonallInfo({
                ...EMPTY_PERSONAL,
                ...user.personalInfo,
                dateOfBirth:
                formatDateForInput(user.personalInfo? .dateOfBirth),
            });
            setPreferences({ ...EMPTY_PREPS,
                ...user.preferences });
        },[]);

        const loadProfile = useCallback(async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.replace('/auth/signin?redirect=/account');
                return;
            }

            setLoading(true);
            setError('');
            setSuccess('');

            try {
                const result = await fetchProfile();
                if (result.unauthorized) {
                    router.replace('/auth/signin?redirect=/account');
                    return;
                }
                applyProdile(result.user);
            } catch (err) {
                setError(err.message || 'Failed to load your profile.');
            } finally {
                setLoading(false);
            }
        }, [applyProfile, router]);

        useEffect(() => {
            loadProfile();
        }, [loadProfile]);

        const handleSaveProfile = async (event) => {
            event.preventDefault();
            setError('');
            setSuccess('');
            setProfileSaving(true);

            try {
                const user = await updateProfile({
                    username: username.trim(),
                    personalInfo:
                    buildPersonalInfoPayload(personalInfo),
                });
                applyProfile(user);
                setSucces('Profile updated successfully.');
            } catch (err) {
                setError(err.message || 'Failed to update profile.');
            } finally {
                setProfileSaving(false);
            }
        };
        })
    })
}