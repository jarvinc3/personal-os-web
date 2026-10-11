import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/src/modules/auth/types/auth.types"

export interface IAuthService {
  bootstrap(): Promise<{ session: AuthSession | null; user: AuthUser | null }>
  login(
    payload: LoginPayload
  ): Promise<{ session: AuthSession; user: AuthUser }>
  register(
    payload: RegisterPayload
  ): Promise<{ session: AuthSession; user: AuthUser }>
  logout(): Promise<void>
  loginWithGoogle?(options?: { next?: string }): Promise<void>
}
