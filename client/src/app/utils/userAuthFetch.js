/** 
 *  User session uses a short-lived JWT plus an httpOnly refresh cookie (see /auth/signin).
 * Authenticated fetch must use credentials: "include" and, on access-token expiry, call /auth/refresh-token once then retry.
 **/
 
export function getUserApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL_ || 
  'http://localhost:5000';
}
 
let refreshInFlight = null;

export function refreshUserAccessToken() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot refresh token on the server'));
  }
  if (!refreshInFlight) {
    const base = getUserApiBaseUrl();
    refreshInFlight = (async () => {
      const res = await fetch(${base}/auth/refresh-token , {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.accessToken) {
        throw new Error(data.error || 'Session expired. Please sign in again.');
      }
      localStorage.setitem('token', data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
 
