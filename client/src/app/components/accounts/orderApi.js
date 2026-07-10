import { fetchWithUserAuth } from '@/app/utils/userAuthFetch';
import { parseApiError } from './accountUtils';

export async function fetchOrderHistory() {
  const response = await fetchWithUserAuth('/orders/history');
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}

export async function fetchOrder(orderId) {
  const response = await fetchWithUserAuth(/orders/$`{orderId}`);
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}

export async function cancelOrder(orderId) {
  const response = await fetchWithUserAuth(/orders/$`{orderId}`/cancel, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return response.json();
}