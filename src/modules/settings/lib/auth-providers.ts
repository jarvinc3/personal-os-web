import { getSupabaseBrowserClient } from "@/src/config/supabase/client"

export type AuthProviderKind = "email" | "google" | "unknown"

export function getAuthProviderKinds(
  identities: { provider?: string }[] | undefined
): AuthProviderKind[] {
  if (!identities?.length) {
    return []
  }

  const providers = new Set<AuthProviderKind>()
  for (const identity of identities) {
    if (identity.provider === "email") {
      providers.add("email")
      continue
    }
    if (identity.provider === "google") {
      providers.add("google")
      continue
    }
    providers.add("unknown")
  }

  return [...providers]
}

export function hasEmailPasswordProvider(
  identities: { provider?: string }[] | undefined
): boolean {
  return getAuthProviderKinds(identities).includes("email")
}

export function isGoogleOnlyAccount(
  identities: { provider?: string }[] | undefined
): boolean {
  const kinds = getAuthProviderKinds(identities)
  return kinds.length === 1 && kinds[0] === "google"
}

export async function fetchCurrentAuthIdentities() {
  const {
    data: { user },
    error,
  } = await getSupabaseBrowserClient().auth.getUser()

  if (error || !user) {
    return {
      user: null,
      identities: undefined as { provider?: string }[] | undefined,
    }
  }

  return {
    user,
    identities: user.identities,
  }
}
