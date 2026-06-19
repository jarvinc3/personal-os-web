export type ApiErrorBody = {
  message?: string;
  code?: string;
  path?: string;
  requestId?: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly requestId?: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiEnvelope<T>(payload: unknown): payload is { data: T; meta?: unknown } {
  return typeof payload === 'object' && payload !== null && 'data' in payload;
}

export function isTransientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }
  return true;
}

export function mapStatusToError(
  status: number,
  body: ApiErrorBody,
  fallbackPath?: string,
): ApiError {
  const messageFromBody = typeof body.message === 'string' ? body.message : undefined;
  const code = typeof body.code === 'string' ? body.code : undefined;
  const requestId = typeof body.requestId === 'string' ? body.requestId : undefined;
  const path = typeof body.path === 'string' ? body.path : fallbackPath;

  switch (status) {
    case 401:
      return new ApiError(
        401,
        messageFromBody ?? 'Sesión expirada, inicia sesión de nuevo',
        code ?? 'UNAUTHORIZED',
        requestId,
        path,
      );
    case 403:
      return new ApiError(
        403,
        messageFromBody ?? 'No tienes permiso para esta acción',
        code ?? 'FORBIDDEN',
        requestId,
        path,
      );
    case 404:
      return new ApiError(
        404,
        messageFromBody ?? 'El recurso no existe',
        code ?? 'NOT_FOUND',
        requestId,
        path,
      );
    default:
      if (status >= 500) {
        return new ApiError(
          status,
          messageFromBody ?? 'Error del servidor, intenta más tarde',
          code ?? 'SERVER_ERROR',
          requestId,
          path,
        );
      }
      return new ApiError(
        status,
        messageFromBody ?? 'Error en la solicitud',
        code,
        requestId,
        path,
      );
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
