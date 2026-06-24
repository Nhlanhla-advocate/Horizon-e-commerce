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
    
    const loadAll = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
          const result = await api.fetchProfile();
          if (result.unauthorized) {
            onUnauthorized?.();
            return;
          }
          applyProfile(result.admin);
    
          try {
            const historyData = await api.fetchLoginHistory(25);
            setLoginHistory(historyData.loginHistory || []);
          } catch {
            setLoginHistory([]);
          }
        } catch (err) {
          setError(err.message || 'Failed to load account.');
        } finally {
          setLoading(false);
        }
      }, [api, applyProfile, onUnauthorized]);
    
      useEffect(() => {
        loadAll();
      }, [loadAll]);

      const handleSaveProfile = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setProfileSaving(true);
        try {
            const admin = await api.updateProfile({
                username: username.trim(),
                personalInfo: buildPersonalInfoPayload(personalInfo),
            });
            applyProfile(admin);
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setProfileSaving(false);
        }
      };

      const handleChangePassword = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          setError('New passwords do not match.');
          return;
        }
        setPasswordSaving(true);
        try {
          await api.changePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          });
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
          const admin = await api.uploadAvatar(file);
          applyProfile(admin);
          setSuccess('Profile photo updated.');
        } catch (err) {
          setError(err.message || 'Failed to upload photo.');
        } finally {
          setAvatarUploading(false);
        }
      };

      const handleSaveNotifications = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setNotifSaving(true);
        try {
          const admin = await api.updateNotifications(notifications);
          applyProfile(admin);
          setSuccess('Notification preferences saved.');
        } catch (err) {
          setError(err.message || 'Failed to save notifications.');
        } finally {
          setNotifSaving(false);
        }
      };

      const handleSetupTwoFactor = async () => {
        setError('');
        setSuccess('');
        setTwoFactorLoading(true);
        try {
          const data = await api.setupTwoFactor();
          setTwoFactorSetup(data);
          setTwoFactorToken('');
          setSuccess('Scan the setup URL in your authenticator app, then enter the 6-digit code.');
        } catch (err) {
          setError(err.message || 'Failed to start 2FA setup.');
        } finally {
          setTwoFactorLoading(false);
        }
      };

      const handleVerifyTwoFactor = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setTwoFactorLoading(true);
        try {
          await api.verifyTwoFactor(twoFactorToken);
          setTwoFactorSetup(null);
          setTwoFactorToken('');
          await loadAll();
          setSuccess('Two-factor authentication enabled.');
        } catch (err) {
          setError(err.message || 'Failed to verify 2FA code.');
        } finally {
          setTwoFactorLoading(false);
        }
      };

      const handleDisableTwoFactor = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setTwoFactorLoading(true);
        try {
          await api.disableTwoFactor(disable2faForm);
          setDisable2faForm({ currentPassword: '', token: '' });
          await loadAll();
          setSuccess('Two-factor authentication disabled.');
        } catch (err) {
          setError(err.message || 'Failed to disable 2FA.');
        } finally {
          setTwoFactorLoading(false);
        }
      };

      if (!profile) {
        return (
          <div className="staff-account">
            {error && <div className="staff-account-alert staff-account-alert--error">{error}</div>}
            <button type="button" className="admin-btn admin-btn-primary" onClick={loadAll}>
              Try again
            </button>
          </div>
        );
      }
    
      const twoFactorEnabled = Boolean(profile.twoFactor?.enabled);

      return (
        <div className="staff-account">
          <header className="staff-account-header">
            <h1 className="staff-account-title">{title}</h1>
            <p className="staff-account-subtitle">{subtitle}</p>
            <div className="staff-account-meta">
              <span className="staff-account-badge">{profile.role?.replace('_', ' ') || 'staff'}</span>
              <span className={staff-account-status staff-account-status--${profile.status || 'active'}}>
                {profile.status || 'active'}
              </span>
            </div>
          </header>
    
          {error && <div className="staff-account-alert staff-account-alert--error">{error}</div>}
          {success && <div className="staff-account-alert staff-account-alert--success">{success}</div>}
    
          <section className="admin-card staff-account-section">
            <h2 className="admin-card-title">Profile photo</h2>
            <div className="staff-account-avatar-row">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="staff-account-avatar" />
              ) : (
                <div className="staff-account-avatar staff-account-avatar--placeholder">{getInitials(profile)}</div>
              )}
              <div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept={IMAGE_ACCEPT}
                  className="staff-account-file-input"
                  onChange={handleAvatarUpload}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  disabled={avatarUploading}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {avatarUploading ? 'Uploading...' : 'Upload photo'}
                </button>
              </div>
            </div>
          </section>
}