import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import type { IAuthService } from "@/src/modules/auth/types/auth-provider.interface"
import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/src/modules/auth/types/auth.types"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import type { AuthError, Session, User } from "@supabase/supabase-js"

export const REGISTER_PENDING_VERIFICATION = "REGISTER_PENDING_VERIFICATION"

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = "AuthServiceError"
  }
}

function mapSession(session: Session): AuthSession {
  return {
    token: session.access_token,
    userId: session.user.id,
    expiresAt: (session.expires_at ?? 0) * 1000,
    refreshToken: session.refresh_token,
  }
}

function mapUser(user: User): AuthUser {
  const metadata = user.user_metadata ?? {}
  const email = user.email ?? ""

  return {
    id: user.id,
    email,
    fullName:
      typeof metadata.full_name === "string" && metadata.full_name.length > 0
        ? metadata.full_name
        : (email.split("@")[0] ?? "User"),
    avatarUrl:
      typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
    profile: null,
  }
}

export function mapSupabaseSession(session: Session): AuthSession {
  return mapSession(session)
}

export function mapSupabaseUser(user: User): AuthUser {
  return mapUser(user)
}

function getAuthErrorMessage(
  error: AuthError | null,
  fallback: string
): string {
  return error?.message ?? fallback
}

class SupabaseAuthService implements IAuthService {
  private get supabase() {
    return getSupabaseBrowserClient()
  }

  async bootstrap(): Promise<{
    session: AuthSession | null
    user: AuthUser | null
  }> {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession()

    if (error) {
      throw new AuthServiceError(
        getAuthErrorMessage(error, "No se pudo restaurar la sesión"),
        error.code,
        error
      )
    }

    if (!session) {
      return { session: null, user: null }
    }

    return {
      session: mapSession(session),
      user: mapUser(session.user),
    }
  }

  async login(
    payload: LoginPayload
  ): Promise<{ session: AuthSession; user: AuthUser }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    })

    if (error || !data.session || !data.user) {
      throw new AuthServiceError(
        getAuthErrorMessage(error, "No se pudo iniciar sesión"),
        error?.code,
        error
      )
    }

    return {
      session: mapSession(data.session),
      user: mapUser(data.user),
    }
  }

  async register(
    payload: RegisterPayload
  ): Promise<{ session: AuthSession; user: AuthUser }> {
    const { data, error } = await this.supabase.auth.signUp({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      options: {
        data: {
          full_name: payload.fullName.trim(),
        },
      },
    })

    if (error || !data.user) {
      throw new AuthServiceError(
        getAuthErrorMessage(error, "No se pudo crear la cuenta"),
        error?.code,
        error
      )
    }

    if (!data.session) {
      throw new AuthServiceError(
        "Debes verificar tu email antes de iniciar sesión.",
        REGISTER_PENDING_VERIFICATION
      )
    }

    return {
      session: mapSession(data.session),
      user: mapUser(data.user),
    }
  }

  async loginWithGoogle(options?: { next?: string }): Promise<void> {
    const next = options?.next ?? APP_ROUTES.app.home
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    })

    if (error) {
      throw new AuthServiceError(
        getAuthErrorMessage(error, "No se pudo iniciar el flujo con Google"),
        error.code,
        error
      )
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new AuthServiceError(
        getAuthErrorMessage(error, "No se pudo cerrar sesión"),
        error.code,
        error
      )
    }
  }
}

export const supabaseAuthService: IAuthService = new SupabaseAuthService()
