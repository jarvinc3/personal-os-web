/**
 * La landing dejó de vivir en este repo: se sirve desde `personal-os-landing`
 * (Astro). Este módulo es `.mjs` porque `next.config.mjs` lo importa sin
 * transpilar para declarar las redirecciones permanentes.
 */
const FALLBACK_LANDING_URL = "https://personal-os-landing-six.vercel.app"

/**
 * Normaliza el origen configurado en `NEXT_PUBLIC_LANDING_URL`. Sin valor usa
 * la landing publicada; con un valor que no sea un origen, falla en el build.
 */
export function resolveLandingUrl(configuredUrl) {
  const candidate = typeof configuredUrl === "string" ? configuredUrl.trim() : ""
  if (candidate === "") {
    return FALLBACK_LANDING_URL
  }

  const { origin, pathname } = new URL(candidate)
  if (pathname !== "/") {
    throw new Error(
      `NEXT_PUBLIC_LANDING_URL debe ser un origen sin ruta: ${candidate}`
    )
  }

  return origin
}

/** Origen de la landing, sin barra final. */
export const LANDING_URL = resolveLandingUrl(process.env.NEXT_PUBLIC_LANDING_URL)

/** URL absoluta de una ruta de la landing; `landingUrl()` apunta a su portada. */
export function landingUrl(path = "/", baseUrl = LANDING_URL) {
  return new URL(path, `${baseUrl}/`).href
}

/**
 * Rutas públicas que este cliente ya no sirve. `source` es la ruta retirada
 * aquí y `destination` su equivalente en la landing.
 */
export const RETIRED_PUBLIC_PATHS = [
  { source: "/landing", destination: "/" },
  { source: "/privacy", destination: "/privacy" },
  { source: "/terms", destination: "/terms" },
  { source: "/faq", destination: "/faq" },
  { source: "/contact", destination: "/contact" },
  { source: "/delete-account", destination: "/delete-account" },
]
