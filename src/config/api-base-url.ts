const DEFAULT_API_BASE_URL = 'http://localhost:3100/api';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL;
  return normalizeBaseUrl(configured);
}

export const API_BASE_URL = resolveApiBaseUrl();

if (process.env.NODE_ENV === 'development') {
  console.debug('[API] Base URL:', API_BASE_URL);
}
