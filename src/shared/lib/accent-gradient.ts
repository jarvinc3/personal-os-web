export const ACCENT_GRADIENT_END = "#0b1220"

/** Brand accent used when an entity has no color of its own. */
export const ACCENT_FALLBACK_COLOR = "#1B4332"

export function accentSurfaceGradient(accentColor: string): string {
  return `linear-gradient(160deg, ${accentColor} 0%, ${ACCENT_GRADIENT_END} 100%)`
}
