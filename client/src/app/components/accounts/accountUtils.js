export const parseApiError = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((entry) => entry.msg).join(' ');
  }
  return data.message || data.error || 'Something went wrong. Please try again.';
};

export const formatDateForInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

export const buildPersonalInfoPayload = (personal) => {
  const payload = {};
  Object.entries(personal).forEach(([key, value]) => {
    const trimmed = typeof value === 'string' ? value.trim() : value;
    if (trimmed !== '' && trimmed != null) {
      payload[key] = key === 'dateOfBirth' ? new Date(trimmed).toISOString() : trimmed;
    }
  });
  return payload;
};

export const getInitials = (profile) => {
  const first = profile?.personalInfo?.firstName?.[0] || profile?.username?.[0] || '?';
  const last = profile?.personalInfo?.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase();
};
