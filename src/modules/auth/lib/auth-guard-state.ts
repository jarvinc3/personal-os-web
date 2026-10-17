import type { AuthUser } from "@/src/modules/auth/types/auth.types"

export type AuthGuardState = {
  isLoading: boolean
  isAuthenticated: boolean
  user: AuthUser | null
}

export function resolveAuthGuardState({
  bootstrapped,
  user,
}: {
  bootstrapped: boolean
  user: AuthUser | null
}): AuthGuardState {
  return {
    isLoading: !bootstrapped,
    isAuthenticated: Boolean(user?.profile),
    user,
  }
}
