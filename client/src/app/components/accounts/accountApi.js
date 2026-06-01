import { fetchWithUserAuth } from '@/app/utils/userAuthFetch';
import { parseApiError } from './accountUtils';

async function requestJson(url, options = {}) {
  const response = await fetchWithUserAuth(url, options);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}

export async function fetchProfile() {
  const response = await fetchWithUserAuth('/user/profile');
  if (response.status === 401) {
    return { unauthorized: true };
  }
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return { user: await response.json() };
}

export function updateProfile(payload) {
  return requestJson('/user/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload) {
  return requestJson('/user/profile/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('image', file);
  return requestJson('/user/profile/upload/avatar', {
    method: 'POST',
    body: formData,
  });
}

export function addAddress(address) {
  return requestJson('/user/profile/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
}

export function updateAddress(addressId, address) {
  return requestJson(`/user/profile/addresses/${addressId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address),
  });
}

export function deleteAddress(addressId) {
  return requestJson(`/user/profile/addresses/${addressId}`, {
    method: 'DELETE',
  });
}
