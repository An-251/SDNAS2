const defaultPort = process.env.PORT || 3000;

const normalizeBaseUrl = (value) => {
  if (!value) return null;

  const trimmed = value.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : null;
};

const normalizePrefix = (value) => {
  if (value === undefined || value === null) return '/api';

  const trimmed = value.trim();
  return trimmed ? trimmed : '/api';
};

const baseUrl = normalizeBaseUrl(process.env.API_BASE_URL)
  || `http://localhost:${defaultPort}`;
const normalizedPrefix = normalizePrefix(process.env.API_PREFIX);
const disablePrefix = normalizedPrefix.toLowerCase() === 'none';
const prefixSegment = disablePrefix
  ? ''
  : `/${normalizedPrefix.replace(/^\/+|\/+$/g, '')}`;

export const apiBaseUrl = `${baseUrl}${prefixSegment}`;
export const isHttps = apiBaseUrl.startsWith('https://');
