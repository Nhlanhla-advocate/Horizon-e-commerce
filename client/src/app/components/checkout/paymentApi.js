import { fetchWithUserAuth } from '@/app/utils/userAuthFetch';
import { parseApiError } from './accountUtils';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchStripeConfig() {
  const response = await fetch(${API_BASE}/payments/config);
  if (!response.ok) {
    throw new Error('Unable to load payment configuration');
  }
  return response.json();
}

export async function createPaymentIntent() {
  const response = await fetchWithUserAuth('/payments/create-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || (await parseApiError(response)));
  }
  return data;
}

export async function completePayment(paymentIntentId) {
  const response = await fetchWithUserAuth('/payments/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || (await parseApiError(response)));
  }
  return data;
}