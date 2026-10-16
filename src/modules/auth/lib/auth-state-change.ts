export type AuthStateChangeDecision<TSession, TUser> =
  | { kind: "clear-session" }
  | { kind: "initial-session"; session: TSession | null }
  | { kind: "keep-session"; session: TSession; user: TUser }
  | { kind: "establish-session"; session: TSession }
  | { kind: "clear" }

/**
 * Turns a Supabase auth event into what the bootstrap hook must do. Kept pure
 * so each branch is testable without rendering.
 */
export function resolveAuthStateChangeDecision<
  TSession,
  TUser extends { profile?: unknown },
>({
  event,
  session,
  currentUser,
}: {
  event: string
  session: TSession | null
  currentUser: TUser | null
}): AuthStateChangeDecision<TSession, TUser> {
  if (event === "SIGNED_OUT") {
    return { kind: "clear-session" }
  }

  if (event === "INITIAL_SESSION") {
    return { kind: "initial-session", session }
  }

  if (!session) {
    return { kind: "clear" }
  }

  if (event === "TOKEN_REFRESHED" && currentUser?.profile) {
    return { kind: "keep-session", session, user: currentUser }
  }

  return { kind: "establish-session", session }
}
