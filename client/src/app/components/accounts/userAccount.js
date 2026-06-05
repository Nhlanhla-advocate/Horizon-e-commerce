'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  changePassword,
  fetchProfile,
  updateProfile,
  uploadAvatar,
} from './accountApi';
import {
  buildPersonalInfoPayload,
  formatDateForInput,
  getInitials,
} from './accountUtils';
import { EMPTY_PERSONAL, EMPTY_PREFS, IMAGE_ACCEPT } from './constants';
import { CURRENCIES, LANGUAGES } from './localeData';
import { useLocale } from '@/app/i18n/LocaleProvider';
import AddressSection from './AddressSection';
import LocationDetector from './LocationDetector';
import '../../assets/css/userAccount.css';

export default function UserAccount() {
  const router = useRouter();
  const avatarInputRef = useRef(null);
  const { setLocale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [personalInfo, setPersonalInfo] = useState(EMPTY_PERSONAL);
  const [preferences, setPreferences] = useState(EMPTY_PREFS);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewerImage, setViewerImage] = useState(null);

  useEffect(() => {
    if (!viewerImage) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setViewerImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerImage]);

  const applyProfile = useCallback((user) => {
    setProfile(user);
    setUsername(user.username || '');
    setPersonalInfo({
      ...EMPTY_PERSONAL,
      ...user.personalInfo,
      dateOfBirth: formatDateForInput(user.personalInfo?.dateOfBirth),
    });
    setPreferences({ ...EMPTY_PREFS, ...user.preferences });
  }, []);

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
      applyProfile(result.user);
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
        personalInfo: buildPersonalInfoPayload(personalInfo),
      });
      applyProfile(user);
      setSuccess('Profile updated successfully.');
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
      const user = await updateProfile({ preferences });
      applyProfile(user);
      setLocale({
        language: user.preferences?.language,
        currency: user.preferences?.currency,
      });
      setSuccess('Preferences saved.');
    } catch (err) {
      setError(err.message || 'Failed to save preferences.');
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleApplyDetectedLocale = async ({ language, currency }) => {
    setError('');
    setSuccess('');
    setPrefsSaving(true);

    const nextPreferences = { ...preferences, language, currency };

    try {
      const user = await updateProfile({ preferences: nextPreferences });
      applyProfile(user);
      setLocale({ language, currency });
      setSuccess('Language and currency updated for your region.');
    } catch (err) {
      setPreferences(nextPreferences);
      setError(err.message || 'Failed to apply your regional settings.');
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
    if (!file) return;

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

  if (loading) {
    return (
      <div className="user-account-page">
        <div className="user-account-loading">Loading your account...</div>
      </div>
    );
  }

  if (!profile) {
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
            <button
              type="button"
              className="user-account-avatar-button"
              onClick={() => setViewerImage(profile.avatar)}
              aria-label="View profile photo"
            >
              <img src={profile.avatar} alt="Your profile" className="user-account-avatar-preview" />
            </button>
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

      <AddressSection
        addresses={profile.addresses || []}
        onUpdated={applyProfile}
        onError={setError}
        onSuccess={setSuccess}
      />

      <form className="user-account-card" onSubmit={handleChangePassword}>
        <h2>Change password</h2>
        <div className="user-account-grid user-account-grid--single">
          <div className="user-account-field user-account-password-toggle">
            <label htmlFor="currentPassword">Current password</label>
            <div className="user-account-password-input-wrap">
              <input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="user-account-password-toggle-btn"
                onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
              >
                {showPasswords.current ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="user-account-field user-account-password-toggle">
            <label htmlFor="newPassword">New password</label>
            <div className="user-account-password-input-wrap">
              <input
                id="newPassword"
                type={showPasswords.next ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                autoComplete="new-password"
                required
                minLength={6}
              />
              <button
                type="button"
                className="user-account-password-toggle-btn"
                onClick={() => setShowPasswords((p) => ({ ...p, next: !p.next }))}
              >
                {showPasswords.next ? 'Hide' : 'Show'}
              </button>
            </div>
            <span className="user-account-field-hint">
              At least 6 characters with uppercase, lowercase, number, and special character.
            </span>
          </div>
          <div className="user-account-field user-account-password-toggle">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <div className="user-account-password-input-wrap">
              <input
                id="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="user-account-password-toggle-btn"
                onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
              >
                {showPasswords.confirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>
        <div className="user-account-actions">
          <button type="submit" className="user-account-btn user-account-btn--primary" disabled={passwordSaving}>
            {passwordSaving ? 'Updating...' : 'Update password'}
          </button>
        </div>
      </form>

      <form className="user-account-card" onSubmit={handleSavePreferences}>
        <h2>Preferences</h2>
        <LocationDetector
          language={preferences.language}
          currency={preferences.currency}
          applying={prefsSaving}
          onApply={handleApplyDetectedLocale}
        />
        <div className="user-account-prefs">
          <div className="user-account-pref-row">
            <label htmlFor="newsletter">Newsletter</label>
            <input
              id="newsletter"
              type="checkbox"
              checked={preferences.newsletter}
              onChange={() => setPreferences((p) => ({ ...p, newsletter: !p.newsletter }))}
            />
          </div>
          <div className="user-account-pref-row">
            <label htmlFor="marketingEmails">Marketing emails</label>
            <input
              id="marketingEmails"
              type="checkbox"
              checked={preferences.marketingEmails}
              onChange={() => setPreferences((p) => ({ ...p, marketingEmails: !p.marketingEmails }))}
            />
          </div>
          <div className="user-account-pref-row">
            <label htmlFor="orderUpdates">Order updates</label>
            <input
              id="orderUpdates"
              type="checkbox"
              checked={preferences.orderUpdates}
              onChange={() => setPreferences((p) => ({ ...p, orderUpdates: !p.orderUpdates }))}
            />
          </div>
          <div className="user-account-pref-row">
            <label htmlFor="smsNotifications">SMS notifications</label>
            <input
              id="smsNotifications"
              type="checkbox"
              checked={preferences.smsNotifications}
              onChange={() => setPreferences((p) => ({ ...p, smsNotifications: !p.smsNotifications }))}
            />
          </div>
          <div className="user-account-field">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value }))}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
          <div className="user-account-field">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              value={preferences.currency}
              onChange={(e) => setPreferences((p) => ({ ...p, currency: e.target.value }))}
            >
              {CURRENCIES.map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.label}
                </option>
              ))}
            </select>
          </div>
          <div className="user-account-field">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => setPreferences((p) => ({ ...p, theme: e.target.value }))}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
        <div className="user-account-actions">
          <button type="submit" className="user-account-btn user-account-btn--primary" disabled={prefsSaving}>
            {prefsSaving ? 'Saving...' : 'Save preferences'}
          </button>
        </div>
      </form>

      {viewerImage && (
        <div
          className="user-account-image-viewer"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={() => setViewerImage(null)}
        >
          <button
            type="button"
            className="user-account-image-viewer-close"
            aria-label="Close image viewer"
            onClick={() => setViewerImage(null)}
          >
            ×
          </button>
          <img
            src={viewerImage}
            alt="Profile"
            className="user-account-image-viewer-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
