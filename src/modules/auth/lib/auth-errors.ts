import { BackendProfileUnavailableError } from "@/src/modules/auth/lib/hydrate-auth-user"
import {
  AuthServiceError,
  REGISTER_PENDING_VERIFICATION,
} from "@/src/modules/auth/services/supabase-auth.service"
import { authVerifyEmailHref } from "@/src/shared/constants/app-routes"

const SESSION_RECOVERY_FALLBACK_MESSAGE =
  "No se pudo verificar tu cuenta con el servidor."
const REVOKE_FALLBACK_TITLE = "No se pudo completar el inicio de sesión"
const REVOKE_FALLBACK_DESCRIPTION =
  "El servidor no está disponible o tu cuenta no está lista. Intenta más tarde."

export type AuthFailureAction =
  | { kind: "silent" }
  | { kind: "verify-email"; href: string }
  | { kind: "toast" }

export function isProfileUnavailableFailure(error: unknown): boolean {
  return error instanceof BackendProfileUnavailableError
}

export function resolveRegisterFailure(
  error: unknown,
  email: string
): AuthFailureAction {
  if (isProfileUnavailableFailure(error)) {
    return { kind: "silent" }
  }

  if (
    error instanceof AuthServiceError &&
    error.code === REGISTER_PENDING_VERIFICATION
  ) {
    return { kind: "verify-email", href: authVerifyEmailHref(email) }
  }

  return { kind: "toast" }
}

export function resolveSessionRecoveryMessage(error: unknown): string {
  if (error instanceof BackendProfileUnavailableError) {
    return error.message
  }

  return SESSION_RECOVERY_FALLBACK_MESSAGE
}

export function resolveRevokeMessages(options?: {
  message?: string
  title?: string
}): { title: string; description: string } {
  return {
    title: options?.title ?? REVOKE_FALLBACK_TITLE,
    description: options?.message ?? REVOKE_FALLBACK_DESCRIPTION,
  }
}
