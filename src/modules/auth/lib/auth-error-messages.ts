import { PASSWORD_MIN_LENGTH } from "@/src/modules/auth/lib/password-policy"

/**
 * Shape read from Supabase Auth errors. `reasons` only exists on the weak
 * password error, so callers pass it explicitly instead of relying on `Error`.
 */
export type AuthErrorLike = {
  code?: string | null
  reasons?: readonly string[] | null
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "El correo o la contraseña no son correctos.",
  email_not_confirmed: "Confirma tu correo antes de iniciar sesión.",
  user_already_exists: "Ya existe una cuenta con este correo.",
  email_exists: "Ya existe una cuenta con este correo.",
  weak_password: "La contraseña no cumple la política de seguridad.",
  over_email_send_rate_limit:
    "Se enviaron demasiados correos. Espera unos minutos antes de reintentar.",
  over_request_rate_limit:
    "Hubo demasiados intentos seguidos. Espera un minuto antes de reintentar.",
}

const WEAK_PASSWORD_REASON_MESSAGES: Record<string, string> = {
  length: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`,
  characters: "La contraseña debe incluir mayúsculas, minúsculas y números.",
  pwned: "Esa contraseña apareció en una filtración pública. Elige otra.",
}

function weakPasswordMessage(reasons: readonly string[] | null | undefined) {
  const knownReasons = (reasons ?? [])
    .map((reason) => WEAK_PASSWORD_REASON_MESSAGES[reason])
    .filter((message): message is string => Boolean(message))

  if (knownReasons.length === 0) {
    return AUTH_ERROR_MESSAGES.weak_password
  }

  return knownReasons.join(" ")
}

/**
 * Returns the Spanish reason for a Supabase Auth code. An unmapped code keeps
 * the operation's own fallback so no provider text reaches the user.
 */
export function translateAuthError(
  error: AuthErrorLike | null | undefined,
  fallback: string
): string {
  if (!error?.code) {
    return fallback
  }

  if (error.code === "weak_password") {
    return weakPasswordMessage(error.reasons)
  }

  return AUTH_ERROR_MESSAGES[error.code] ?? fallback
}
