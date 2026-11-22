import {
  ApiError,
  isApiEnvelope,
  isTransientError,
  mapStatusToError,
  parseRetryAfterHeader,
  sleep,
} from "@/src/config/api-client.utils"
import type { ApiErrorBody } from "@/src/config/api-client.utils"
import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { API_BASE_URL } from "@/src/shared/constants/api-endpoints"
import { authEvents } from "@/src/shared/events/auth-events"
import { logApiError, logApiRequest } from "@/src/shared/lib/log-api-error"
export { ApiError } from "@/src/config/api-client.utils"

type ApiEnvelope<T> = {
  data: T
  meta?: {
    timestamp?: string
    path?: string
    requestId?: string
  }
}

export type ApiRequestConfig = {
  suppressUnauthorizedEvent?: boolean
}

export type ApiClientDependencies = {
  resolveAccessToken: () => Promise<string | null>
  fetchImpl: typeof fetch
}

const MAX_RETRIES = 2
const RETRY_BASE_MS = 500
const TOKEN_REFRESH_THRESHOLD_SEC = 60
const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key"
const IDEMPOTENT_METHODS: ReadonlySet<string> = new Set([
  "POST",
  "PATCH",
  "DELETE",
])

async function resolveSupabaseAccessToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return null
  }

  const expiresAt = session.expires_at ?? 0
  const nowSec = Math.floor(Date.now() / 1000)

  if (expiresAt - nowSec >= TOKEN_REFRESH_THRESHOLD_SEC) {
    return session.access_token
  }

  const { data, error } = await supabase.auth.refreshSession()
  if (error?.code === "refresh_token_not_found") {
    await supabase.auth.signOut({ scope: "local" })
    return null
  }

  if (error || !data.session?.access_token) {
    return session.access_token
  }

  return data.session.access_token
}

export function createApiClient({
  resolveAccessToken,
  fetchImpl,
}: ApiClientDependencies) {
  async function getAuthHeaders(): Promise<{ Authorization?: string }> {
    const accessToken = await resolveAccessToken()

    if (!accessToken) {
      return {}
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    }
  }

  /**
   * One idempotency key per logical call: it is generated on the first
   * attempt and reused by every retry of that same request.
   */
  async function request<T>(
    path: string,
    init?: RequestInit,
    config?: ApiRequestConfig,
    attempt = 0,
    idempotencyKey?: string
  ): Promise<T> {
    const method = init?.method ?? "GET"
    const requestKey =
      idempotencyKey ??
      (IDEMPOTENT_METHODS.has(method) ? crypto.randomUUID() : undefined)

    try {
      const authHeaders = await getAuthHeaders()
      const headers = new Headers(init?.headers)
      const isFormData =
        typeof FormData !== "undefined" && init?.body instanceof FormData
      if (!isFormData) {
        headers.set("Content-Type", "application/json")
      }

      if (authHeaders.Authorization) {
        headers.set("Authorization", authHeaders.Authorization)
      }

      if (requestKey) {
        headers.set(IDEMPOTENCY_KEY_HEADER, requestKey)
      }

      const response = await fetchImpl(`${API_BASE_URL}${path}`, {
        ...init,
        headers,
      })

      if (!response.ok) {
        const errorBody = (await response
          .json()
          .catch(() => ({}))) as ApiErrorBody
        const retryAfterMs = parseRetryAfterHeader(
          response.headers.get("Retry-After")
        )
        const apiError = mapStatusToError(
          response.status,
          errorBody,
          path,
          retryAfterMs
        )
        logApiError(apiError, path)

        if (response.status === 401 && !config?.suppressUnauthorizedEvent) {
          authEvents.emitUnauthorized()
        }

        throw apiError
      }

      if (response.status === 204) {
        return undefined as T
      }

      const body = await response.json()

      if (isApiEnvelope<T>(body)) {
        const envelope = body as ApiEnvelope<T>
        if (
          process.env.NODE_ENV === "development" &&
          envelope.meta?.requestId
        ) {
          logApiRequest(path, envelope.meta.requestId)
        }
        return envelope.data
      }

      return body as T
    } catch (error) {
      if (error instanceof ApiError) {
        if (isTransientError(error) && attempt < MAX_RETRIES) {
          await sleep(RETRY_BASE_MS * 2 ** attempt)
          return request<T>(path, init, config, attempt + 1, requestKey)
        }
        throw error
      }

      logApiError(error, path)

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_MS * 2 ** attempt)
        return request<T>(path, init, config, attempt + 1, requestKey)
      }

      throw error
    }
  }

  const apiGet = <T>(
    path: string,
    signal?: AbortSignal,
    config?: ApiRequestConfig
  ) => request<T>(path, { method: "GET", signal }, config)

  const apiPost = <T>(
    path: string,
    body?: unknown,
    config?: ApiRequestConfig
  ) =>
    request<T>(
      path,
      {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      },
      config
    )

  const apiPatch = <T>(
    path: string,
    body?: unknown,
    config?: ApiRequestConfig
  ) =>
    request<T>(
      path,
      {
        method: "PATCH",
        body: body ? JSON.stringify(body) : undefined,
      },
      config
    )

  /** DELETE with a confirmation body, for endpoints that require one. */
  const apiDeleteWithBody = <T>(
    path: string,
    body?: unknown,
    config?: ApiRequestConfig
  ) =>
    request<T>(
      path,
      {
        method: "DELETE",
        body: body ? JSON.stringify(body) : undefined,
      },
      config
    )

  const apiDelete = <T>(path: string, config?: ApiRequestConfig) =>
    apiDeleteWithBody<T>(path, undefined, config)

  const apiPostForm = <T>(
    path: string,
    body: FormData,
    config?: ApiRequestConfig
  ) => request<T>(path, { method: "POST", body }, config)

  /**
   * POST que devuelve el cuerpo SSE sin esperar a que termine. No reintenta:
   * un reintento automático después de recibir trozos duplicaría la respuesta.
   * El turno se protege con el `clientMessageId` del cuerpo.
   */
  async function apiPostEventStream(
    path: string,
    body: unknown,
    signal?: AbortSignal
  ): Promise<ReadableStream<Uint8Array>> {
    const authHeaders = await getAuthHeaders()
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    })
    if (authHeaders.Authorization) {
      headers.set("Authorization", authHeaders.Authorization)
    }

    const response = await fetchImpl(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errorBody = (await response
        .json()
        .catch(() => ({}))) as ApiErrorBody
      const apiError = mapStatusToError(
        response.status,
        errorBody,
        path,
        parseRetryAfterHeader(response.headers.get("Retry-After"))
      )
      logApiError(apiError, path)
      if (response.status === 401) {
        authEvents.emitUnauthorized()
      }
      throw apiError
    }

    if (!response.body) {
      throw new ApiError(
        500,
        "La respuesta del agente no se puede leer",
        "STREAM_UNAVAILABLE",
        undefined,
        path
      )
    }
    return response.body
  }

  return {
    apiGet,
    apiPost,
    apiPatch,
    apiDelete,
    apiDeleteWithBody,
    apiPostForm,
    apiPostEventStream,
  }
}

const defaultApiClient = createApiClient({
  resolveAccessToken: resolveSupabaseAccessToken,
  fetchImpl: (input, init) => fetch(input, init),
})

export const apiGet = defaultApiClient.apiGet
export const apiPost = defaultApiClient.apiPost
export const apiPatch = defaultApiClient.apiPatch
export const apiDelete = defaultApiClient.apiDelete
export const apiDeleteWithBody = defaultApiClient.apiDeleteWithBody
export const apiPostForm = defaultApiClient.apiPostForm
export const apiPostEventStream = defaultApiClient.apiPostEventStream
