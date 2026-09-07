export const ACCENT_GRADIENT_END = "#0b1220"

export function accentSurfaceGradient(accentColor: string): string {
  return `linear-gradient(160deg, ${accentColor} 0%, ${ACCENT_GRADIENT_END} 100%)`
}
