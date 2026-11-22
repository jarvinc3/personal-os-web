const DEFAULT_DISPLAY_NAME = "Usuario"

type HomeDisplayNameInput = {
  profileFullName?: string | null
  userFullName?: string | null
}

/**
 * BR-HOM-002: manda el perfil, luego el usuario de la sesión y por último el
 * nombre genérico. Un nombre vacío se respeta igual que en la pantalla.
 */
export function resolveHomeDisplayName({
  profileFullName,
  userFullName,
}: HomeDisplayNameInput): string {
  return profileFullName ?? userFullName ?? DEFAULT_DISPLAY_NAME
}
