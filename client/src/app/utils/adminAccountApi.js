const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

const getHeaders = (json = true) => {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
};

const parseError = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((entry) => entry.msg).join(' ');
  }
  return data.message || data.error || `Request failed (${response.status})`;
};

/** @param {string} profilePrefix e.g. '/admin' or '/dashboard/super-admin' */
export function createStaffAccountApi(profilePrefix) {
  const profileBase = `${BASE_URL}${profilePrefix}/profile`;

  return {
    async fetchProfile() {
      const response = await fetch(profileBase, {
        headers: getHeaders(),
        cache: 'no-store',
      });
      if (response.status === 401) return { unauthorized: true };
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      return { admin: data.admin };
    },

    async updateProfile(payload) {
      const response = await fetch(profileBase, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      return data.admin;
    },

    async changePassword(payload) {
      const response = await fetch(`${profileBase}/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await parseError(response));
      return response.json();
    },

    async uploadAvatar(file) {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${profileBase}/upload/avatar`, {
        method: 'POST',
        headers: getHeaders(false),
        body: formData,
      });
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      return data.admin;
    },

    async fetchLoginHistory(limit = 20) {
      const response = await fetch(`${profileBase}/login-history?limit=${limit}`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(await parseError(response));
      return response.json();
    },

    async updateNotifications(notificationPreferences) {
      const response = await fetch(`${profileBase}/notifications`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ notificationPreferences }),
      });
      if (!response.ok) throw new Error(await parseError(response));
      const data = await response.json();
      return data.admin || data;
    },

    async setupTwoFactor() {
      const response = await fetch(`${profileBase}/2fa/setup`, {
        method: 'POST',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error(await parseError(response));
      return response.json();
    },

    async verifyTwoFactor(token) {
      const response = await fetch(`${profileBase}/2fa/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error(await parseError(response));
      return response.json();
    },

    async disableTwoFactor(payload) {
      const response = await fetch(`${profileBase}/2fa`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(await parseError(response));
      return response.json();
    },
  };
}

export const adminAccountApi = createStaffAccountApi('/admin');
export const superAdminAccountApi = createStaffAccountApi('/dashboard/super-admin');

export function getAdminAuthHeaders() {
  return getHeaders();
}

export { BASE_URL as ADMIN_API_BASE };
