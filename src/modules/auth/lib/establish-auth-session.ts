import { queryClient } from "@/src/config/query-client"
import { resolveSessionRecoveryMessage } from "@/src/modules/auth/lib/auth-errors"
import {
  hydrateAuthUser,
  PROFILE_QUERY_KEY,
} from "@/src/modules/auth/lib/hydrate-auth-user"
import { revokeAuthSession } from "@/src/modules/auth/lib/revoke-auth-session"
import {
  mapSupabaseSession,
  mapSupabaseUser,
} from "@/src/modules/auth/services/supabase-auth.service"
import type { AuthUser } from "@/src/modules/auth/types/auth.types"
import { useAppStore } from "@/src/shared/store/app-store"
import type { Session } from "@supabase/supabase-js"

export async function establishAuthenticatedSession(
  session: Session
): Promise<AuthUser> {
  const mappedSession = mapSupabaseSession(session)

  try {
    const hydrated = await hydrateAuthUser(mapSupabaseUser(session.user))
    useAppStore
      .getState()
      .setAuthState({ session: mappedSession, user: hydrated })
    queryClient.setQueryData(PROFILE_QUERY_KEY, hydrated.profile)
    return hydrated
  } catch (error) {
    await revokeAuthSession({
      message: resolveSessionRecoveryMessage(error),
    })
    throw error
  }
}
