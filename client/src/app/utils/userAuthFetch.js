/**
 * User session uses a short-lived JWT plus an httpOnly refresh cookie (see /auth/signin).
 * Authenticated fetch must use credentials: "include" and, on access-token expiry, call /auth/refresh-token once then retry.
 */

export function getUserApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
}

let refreshInFlight = null;

export function refreshUserAccessToken() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot refresh token on the server'));
  }
  if (!refreshInFlight) {
    const base = getUserApiBaseUrl();
    refreshInFlight = (async () => {
      const res = await fetch(`${base}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.accessToken) {
        throw new Error(data.error || 'Session expired. Please sign in again.');
      }
      localStorage.setItem('token', data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function resolveUrl(url) {
  if (typeof url === 'string' && url.startsWith('http')) 
    return url;
  const base = getUserApiBaseUrl().replace(/\/$/, '');
  const path = typeof url === 'string' ? url : '';
  const normalized = path.startsWith('/') ? path :
  `/${path}`;
  return `${base}${normalized}`;
}

function isAccessTokenExpiredPayload(body) {
  if (!body || typeof body !== 'object') return false;
  if (body.code === 'TOKEN_EXPIRED') return true;
  const msg = String(body.error || body.message || '').toLowerCase();
  return msg.includes('expired') && msg.includes('token');
}

/**
 * Like fetch(), but sends the user Bearer token, includes cookies, and retries once after a successful refresh when the access JWT expired.
 */
export async function fetchWithUserAuth(url, options = {}) {
  if (typeof window === 'undefined') {
    throw new Error('fetchWithUserAuth is only for browser use');
  }
