import { queryClient } from "@/src/config/query-client"
import { getSupabaseBrowserClient } from "@/src/config/supabase/client"
import { resolveRevokeMessages } from "@/src/modules/auth/lib/auth-errors"
import { PROFILE_QUERY_KEY } from "@/src/modules/auth/lib/hydrate-auth-user"
import { useAppStore } from "@/src/shared/store/app-store"
import { appToast } from "@/src/shared/lib/app-toast"

type RevokeAuthSessionOptions = {
  message?: string
  title?: string
}

export async function revokeAuthSession(options?: RevokeAuthSessionOptions) {
  useAppStore.getState().clearAuthState()
  void queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY })
  await getSupabaseBrowserClient()
    .auth.signOut()
    .catch(() => undefined)

  const messages = resolveRevokeMessages(options)
  appToast.error({ text1: messages.title, text2: messages.description })
}
