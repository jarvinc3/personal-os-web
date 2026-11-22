/**
 * Cabeceras de seguridad del cliente.
 *
 * Vive en `.mjs` porque `next.config.mjs` no puede importar TypeScript, igual
 * que `src/shared/constants/landing.mjs`.
 */

export const CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy"
export const CSP_NONCE_HEADER = "x-nonce"

const PRODUCTION_HSTS = "max-age=63072000; includeSubDomains"
// En desarrollo Vercel Analytics carga su script de depuración desde su CDN;
// en producción el script es del propio origen.
const VERCEL_ANALYTICS_DEBUG_ORIGIN = "https://va.vercel-scripts.com"
// La barra de Vercel se inyecta en las previews y pide su script, estilos,
// tipografías y un WebSocket de comentarios.
const VERCEL_LIVE_ORIGIN = "https://vercel.live"
const VERCEL_TOOLBAR_WEBSOCKET_ORIGIN = "wss://ws-us3.pusher.com"
const VERCEL_ASSETS_ORIGIN = "https://assets.vercel.com"

/**
 * Cabeceras que no dependen de la petición. `next.config.mjs` las pone en todas
 * las rutas; la CSP vive en `proxy.ts` porque lleva un nonce por petición.
 *
 * @param {{ isProduction: boolean }} input
 * @returns {{ key: string, value: string }[]}
 */
export function staticSecurityHeaders({ isProduction }) {
  const headers = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    },
  ]

  if (isProduction) {
    headers.push({ key: "Strict-Transport-Security", value: PRODUCTION_HSTS })
  }

  return headers
}

/**
 * El nonce de CSP solo acepta caracteres base64, así que el UUID se codifica.
 *
 * @returns {string}
 */
export function createNonce() {
  return btoa(crypto.randomUUID())
}

/**
 * Arma la CSP de una petición. Los orígenes salen del entorno para que
 * desarrollo, preview y producción usen el API y Supabase que tienen asignados.
 *
 * @param {{
 *   nonce: string,
 *   isDevelopment: boolean,
 *   isVercelPreview: boolean,
 *   apiUrl?: string,
 *   supabaseUrl?: string,
 *   sentryDsn?: string,
 * }} input
 * @returns {string}
 */
export function contentSecurityPolicy({
  nonce,
  isDevelopment,
  isVercelPreview,
  apiUrl,
  supabaseUrl,
  sentryDsn,
}) {
  const apiOrigin = originOf(apiUrl)
  const supabaseOrigin = originOf(supabaseUrl)
  const sentryOrigin = originOf(sentryDsn)

  const scriptSources = ["'self'", `'nonce-${nonce}'`]
  if (isDevelopment) {
    // El recargado en caliente de Turbopack compila con eval.
    scriptSources.push("'unsafe-eval'", VERCEL_ANALYTICS_DEBUG_ORIGIN)
  }

  const connectSources = ["'self'"]
  if (apiOrigin) {
    connectSources.push(apiOrigin, webSocketOriginOf(apiOrigin))
  }
  if (supabaseOrigin) {
    connectSources.push(supabaseOrigin)
  }
  if (sentryOrigin) {
    connectSources.push(sentryOrigin)
  }
  if (isDevelopment) {
    connectSources.push("ws:")
  }

  const imageSources = [
    "'self'",
    "data:",
    "blob:",
    "https://img.logo.dev",
    "https://flagcdn.com",
  ]
  if (supabaseOrigin) {
    imageSources.push(supabaseOrigin)
  }

  const styleSources = ["'self'", "'unsafe-inline'"]
  const fontSources = ["'self'", "data:"]
  let frameSources = ["'none'"]

  if (isVercelPreview) {
    scriptSources.push(VERCEL_LIVE_ORIGIN)
    connectSources.push(VERCEL_LIVE_ORIGIN, VERCEL_TOOLBAR_WEBSOCKET_ORIGIN)
    imageSources.push(VERCEL_LIVE_ORIGIN, "https://vercel.com")
    styleSources.push(VERCEL_LIVE_ORIGIN)
    fontSources.push(VERCEL_LIVE_ORIGIN, VERCEL_ASSETS_ORIGIN)
    frameSources = [VERCEL_LIVE_ORIGIN]
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSources.join(" ")}`,
    // Excepción documentada: framer-motion escribe atributos style y chart.tsx
    // inyecta un <style> con variables por gráfico; no se pueden hashear. Los
    // scripts siguen exigiendo nonce.
    `style-src ${styleSources.join(" ")}`,
    `img-src ${imageSources.join(" ")}`,
    `font-src ${fontSources.join(" ")}`,
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    `frame-src ${frameSources.join(" ")}`,
    "manifest-src 'self'",
    "worker-src 'self'",
  ]

  if (!isDevelopment) {
    directives.push("upgrade-insecure-requests")
  }

  return directives.join("; ")
}

/**
 * @param {string | undefined} rawUrl
 * @returns {string | null}
 */
function originOf(rawUrl) {
  if (!rawUrl?.trim()) {
    return null
  }

  return new URL(rawUrl.trim()).origin
}

/**
 * @param {string} httpOrigin
 * @returns {string}
 */
function webSocketOriginOf(httpOrigin) {
  return httpOrigin.replace(/^http/, "ws")
}
