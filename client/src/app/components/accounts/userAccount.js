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

        const handleSavePreferences = async (event) => {
            event.preventDefault();
            setError('');
            setSuccess('');
            setPrefsSaving(true);

            try {
                const user = await updateProdile({ preferences });
                applyProfile(user);
                setSuccess('Preferences saved.');
            } catch (err) {
                setError(err.message || 'Failed to save preferences.');
            } finally {
                setPrefsSaving(false);
            }
        };

        const handleChangePassword = async (event) => {
            event.preventDefault();
            setError('');
            setSuccess('');
            setPasswordSaving(true);

            try {
                await changePassword(passwordForm);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setSuccess('Password updated successfully.');
            } catch (err) {
                setError(err.message || 'Failed to change password.');
            } finally {
                setPasswordSaving(false);
            }
        };

        const handleAvatarUpload = async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if(!file) return;

            setError('');
            setSuccess('');
            setAvatarUploading(true);

            try {
                const data = await uploadAvatar(file);
                applyProfile(data.user);
                setSuccess('Profile photo updated.');
            } catch (err) {
                setError(err.message || 'Failed to upload profile photo.');
            } finally {
                setAvatarUploading(false);
            }
        };

        const handleGalleryUpload = async (event) => {
            const files = Array.from(event.target.files || []);
            event.target.value = '';
            if (files.length === 0) return;

            setError('');
            setSuccess('');
            setGalleryUploading(true);

            try {
                const data = await uploadGalleryImages(files);
                applyProfile(data.user);
                setSuccess( `${files.length} photo${files.length > 1 ? 's' : ''} added to your gallery.`);
            } catch (err) {
                setError(err.message || 'Failed to upload photos');
            } finally {
                setGalleryUploading(false);
            }
        };

        const handleRemoveGalleryImage = async (imageUrl) => {
            if (!profile?.profileImage?.length) return;

            setError('');
            setSuccess('');

            try {
                const nextImages = profile.profileImage.filter((url) => url !== imageUrl);
                const user = awaitremoveGalleryImages(nextImages);
                applyProfile(user);
                setSuccess('Photo removed from gallery.');
            } catch (err) {
                setError(err.message || 'Failed to remove photo.');
            }
        };

        if (loading) {
            return (
                <div className="user-account-pages">
                    <div className="user-account-loading">
                    Loading your account...</div>
                </div>
            );
        }

        
        if(!profile) {
            return (
                <div className="user-account-page">
                {error && <div className="user-account-alert user-account-alert--error">{error}</div>}
                <button type="button" className="user-account-btn user-account-btn--primary" onClick={loadProfile}>
                Try again
                </button>
            </div>
            );
        }

        return (
            <div className="user-account-page">
              <header className="user-account-header">
                <h1>My Account</h1>
                <p>Manage your profile, security settings, addresses, and photos.</p>
              </header>
        
              {error && <div className="user-account-alert user-account-alert--error">{error}</div>}
              {success && <div className="user-account-alert user-account-alert--success">{success}</div>}
        
              <section className="user-account-card">
                <h2>Profile photo</h2>
                <div className="user-account-avatar-row">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Your profile" className="user-account-avatar-preview" />
                  ) : (
                    <div className="user-account-avatar-placeholder" aria-hidden="true">
                      {getInitials(profile)}
                    </div>
                  )}
                  <div className="user-account-avatar-controls">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept={IMAGE_ACCEPT}
                      className="user-account-file-input"
                      onChange={handleAvatarUpload}
                    />
                    <button
                      type="button"
                      className="user-account-btn user-account-btn--secondary"
                      disabled={avatarUploading}
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      {avatarUploading ? 'Uploading...' : 'Upload photo'}
                    </button>
                    <span className="user-account-field-hint">JPG, PNG, WEBP or GIF. Max 5MB.</span>
                  </div>
                </div>
              </section>

              <form className="user-account-card" onSubmit={handleSaveProfile}>
        <h2>Personal details</h2>
        <div className="user-account-grid">
          <div className="user-account-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={profile.email || ''} disabled />
            <span className="user-account-field-hint">Email cannot be changed here.</span>
          </div>
          <div className="user-account-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              required
            />
          </div>
          <div className="user-account-field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              type="text"
              value={personalInfo.firstName}
              onChange={(e) => setPersonalInfo((p) => ({ ...p, firstName: e.target.value }))}
            />
          </div>
          <div className="user-account-field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              type="text"
              value={personalInfo.lastName}
              onChange={(e) => setPersonalInfo((p) => ({ ...p, lastName: e.target.value }))}
            />
          </div>
          <div className="user-account-field">
            <label htmlFor="displayName">Display name</label>
            <input
              id="displayName"
              type="text"
              value={personalInfo.displayName}
              onChange={(e) => setPersonalInfo((p) => ({ ...p, displayName: e.target.value }))}
            />
          </div>
          <div className="user-account-field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => setPersonalInfo((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="user-account-field">
            <label htmlFor="dateOfBirth">Date of birth</label>
            <input
              id="dateOfBirth"
              type="date"
              value={personalInfo.dateOfBirth}
              onChange={(e) => setPersonalInfo((p) => ({ ...p, dateOfBirth: e.target.value }))}
            />
          </div>
        </div>
        <div className="user-account-field user-account-field--full">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            value={personalInfo.bio}
            onChange={(e) => setPersonalInfo((p) => ({ ...p, bio: e.target.value }))}
            maxLength={500}
            placeholder="Tell us a little about yourself"
          />
          <span className="user-account-field-hint">{(personalInfo.bio || '').length}/500 characters</span>
        </div>
        <div className="user-account-actions">
          <button type="submit" className="user-account-btn user-account-btn--primary" disabled={profileSaving}>
            {profileSaving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>

        );
    }
}