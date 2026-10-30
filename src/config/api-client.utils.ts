export type ApiErrorBody = {
  message?: string
  code?: string
  path?: string
  requestId?: string
  /** Sent with a merchant name conflict: the merchant that already has it. */
  existingMerchantId?: string | null
}

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly requestId?: string
  readonly path?: string
  readonly existingMerchantId?: string | null
  readonly retryAfterMs: number | null

  constructor(
    status: number,
    message: string,
    code?: string,
    requestId?: string,
    path?: string,
    details?: {
      existingMerchantId?: string | null
      retryAfterMs?: number | null
    }
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.requestId = requestId
    this.path = path
    this.existingMerchantId = details?.existingMerchantId ?? null
    this.retryAfterMs = details?.retryAfterMs ?? null
  }
}

/** Merchant whose name already exists, when the API said so. */
export function merchantIdFromConflict(error: unknown): string | null {
  return error instanceof ApiError ? (error.existingMerchantId ?? null) : null
}

export function isApiEnvelope<T>(
  payload: unknown
): payload is { data: T; meta?: unknown } {
  return typeof payload === "object" && payload !== null && "data" in payload
}

export function isTransientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500
  }
  return true
}

export function parseRetryAfterHeader(
  value: string | null,
  now = Date.now()
): number | undefined {
  if (!value) {
    return undefined
  }
  const normalized = value.trim()
  const seconds = Number(normalized)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.round(seconds * 1_000)
  }
  const retryAt = Date.parse(normalized)
  if (Number.isNaN(retryAt)) {
    return undefined
  }
  return Math.max(0, retryAt - now)
}

export function mapStatusToError(
  status: number,
  body: ApiErrorBody,
  fallbackPath?: string,
  retryAfterMs?: number
): ApiError {
  const messageFromBody =
    typeof body.message === "string" ? body.message : undefined
  const code = typeof body.code === "string" ? body.code : undefined
  const requestId =
    typeof body.requestId === "string" ? body.requestId : undefined
  const path = typeof body.path === "string" ? body.path : fallbackPath

  switch (status) {
    case 401:
      return new ApiError(
        401,
        messageFromBody ?? "Sesión expirada, inicia sesión de nuevo",
        code ?? "UNAUTHORIZED",
        requestId,
        path
      )
    case 403:
      return new ApiError(
        403,
        messageFromBody ?? "No tienes permiso para esta acción",
        code ?? "FORBIDDEN",
        requestId,
        path
      )
    case 404:
      return new ApiError(
        404,
        messageFromBody ?? "El recurso no existe",
        code ?? "NOT_FOUND",
        requestId,
        path
      )
    case 409:
      return new ApiError(
        409,
        messageFromBody ??
          "La operación ya se está procesando o se repitió; inténtalo más tarde",
        code ?? "CONFLICT",
        requestId,
        path,
        { existingMerchantId: body.existingMerchantId ?? null }
      )
    case 429:
      return new ApiError(
        429,
        messageFromBody ?? "Demasiadas solicitudes, espera un momento",
        code ?? "TOO_MANY_REQUESTS",
        requestId,
        path,
        { retryAfterMs }
      )
    default:
      if (status >= 500) {
        return new ApiError(
          status,
          messageFromBody ?? "Error del servidor, intenta más tarde",
          code ?? "SERVER_ERROR",
          requestId,
          path
        )
      }
      return new ApiError(
        status,
        messageFromBody ?? "Error en la solicitud",
        code,
        requestId,
        path
      )
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
