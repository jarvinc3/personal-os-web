import { ApiError } from '@/src/shared/config/api-client.utils';

export function logApiError(error: unknown, context?: string) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  if (error instanceof ApiError) {
    const prefix = context ? `[API ${context}]` : '[API]';
    const requestIdPart = error.requestId ? ` requestId=${error.requestId}` : '';
    console.warn(
      `${prefix} ${error.status} ${error.code ?? 'ERROR'} path=${error.path ?? 'unknown'}${requestIdPart}: ${error.message}`,
    );
    return;
  }

  if (error instanceof Error) {
    const prefix = context ? `[API ${context}]` : '[API]';
    console.warn(`${prefix} network: ${error.message}`);
  }
}
