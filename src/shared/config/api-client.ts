import {
  ApiError,
  ApiErrorBody,
  isApiEnvelope,
  isTransientError,
  mapStatusToError,
  sleep,
} from '@/src/shared/config/api-client.utils';
import { getSupabaseBrowserClient } from '@/src/shared/config/supabase/client';
import { API_BASE_URL } from '@/src/shared/constants/api-endpoints';
import { authEvents } from '@/src/shared/events/auth-events';
import { logApiError } from '@/src/shared/lib/log-api-error';

export { ApiError } from '@/src/shared/config/api-client.utils';

type ApiEnvelope<T> = {
  data: T;
  meta?: {
    timestamp?: string;
    path?: string;
    requestId?: string;
  };
};

export type ApiRequestConfig = {
  suppressUnauthorizedEvent?: boolean;
};

const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;
const TOKEN_REFRESH_THRESHOLD_SEC = 60;

async function resolveAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const expiresAt = session.expires_at ?? 0;
  const nowSec = Math.floor(Date.now() / 1000);

  if (expiresAt - nowSec >= TOKEN_REFRESH_THRESHOLD_SEC) {
    return session.access_token;
  }

  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) {
    return session.access_token;
  }

  return data.session.access_token;
}

async function getAuthHeaders() {
  const accessToken = await resolveAccessToken();

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

async function request<T>(
  path: string,
  init?: RequestInit,
  config?: ApiRequestConfig,
  attempt = 0,
): Promise<T> {
  try {
    const authHeaders = await getAuthHeaders();
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');

    if (authHeaders.Authorization) {
      headers.set('Authorization', authHeaders.Authorization);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
      const apiError = mapStatusToError(response.status, errorBody, path);
      logApiError(apiError, path);

      if (response.status === 401 && !config?.suppressUnauthorizedEvent) {
        authEvents.emitUnauthorized();
      }

      throw apiError;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const body = await response.json();

    if (isApiEnvelope<T>(body)) {
      const envelope = body as ApiEnvelope<T>;
      if (process.env.NODE_ENV === 'development' && envelope.meta?.requestId) {
        console.debug(`[API] ${path} requestId=${envelope.meta.requestId}`);
      }
      return envelope.data;
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      if (isTransientError(error) && attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_MS * 2 ** attempt);
        return request<T>(path, init, config, attempt + 1);
      }
      throw error;
    }

    logApiError(error, path);

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_BASE_MS * 2 ** attempt);
      return request<T>(path, init, config, attempt + 1);
    }

    throw error;
  }
}

export const apiGet = <T,>(path: string, signal?: AbortSignal, config?: ApiRequestConfig) =>
  request<T>(path, { method: 'GET', signal }, config);

export const apiPost = <T,>(path: string, body?: unknown, config?: ApiRequestConfig) =>
  request<T>(
    path,
    {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    },
    config,
  );

export const apiPatch = <T,>(path: string, body?: unknown, config?: ApiRequestConfig) =>
  request<T>(
    path,
    {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    },
    config,
  );

export const apiDelete = <T,>(path: string, config?: ApiRequestConfig) =>
  request<T>(path, { method: 'DELETE' }, config);
