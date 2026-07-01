const IPIFY_URL = 'https://api.ipify.org?format=json';
const CACHE_KEY = 'clientPublicIp';
const CACHE_MS = 5 * 60 * 1000;

/**
 * Fetches the browser's public IP (via ipify). Cached briefly in sessionStorage.
 * Returns null if the lookup fails or times out.
 */
export async function fetchClientPublicIp() {
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { ip, at } = JSON.parse(cached);
        if (ip && Date.now() - at < CACHE_MS) {
          return ip;
        }
      }
    } catch {
      /* ignore cache errors */
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(IPIFY_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const ip = typeof data?.ip === 'string' ? data.ip.trim() : null;

    if (ip && typeof window !== 'undefined') {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ip, at: Date.now() }));
    }

    return ip;
  } catch {
    return null;
  }
}

/** Headers/body fields to attach to sign-in requests when a public IP is available. */
export async function getLoginIpPayload() {
  const clientIp = await fetchClientPublicIp();
  if (!clientIp) {
    return { body: {}, headers: {} };
  }
  return {
    body: { clientIp },
    headers: { 'X-Client-Public-Ip': clientIp },
  };
}
