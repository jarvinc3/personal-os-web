import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveAuthStateChangeDecision } from "@/src/modules/auth/lib/auth-state-change"

const SESSION = { access_token: "token-1" }
const USER_WITH_PROFILE = { profile: { id: "user-1" } }

describe("resolveAuthStateChangeDecision", () => {
  it("clears the session on SIGNED_OUT even if a session arrives", () => {
    assert.deepEqual(
      resolveAuthStateChangeDecision({
        event: "SIGNED_OUT",
        session: SESSION,
        currentUser: USER_WITH_PROFILE,
      }),
      { kind: "clear-session" }
    )
  })

  it("schedules the initial session without hydrating", () => {
    assert.deepEqual(
      resolveAuthStateChangeDecision({
        event: "INITIAL_SESSION",
        session: SESSION,
        currentUser: null,
      }),
      { kind: "initial-session", session: SESSION }
    )
  })

  it("clears the state when the event brings no session", () => {
    assert.deepEqual(
      resolveAuthStateChangeDecision({
        event: "SIGNED_IN",
        session: null,
        currentUser: USER_WITH_PROFILE,
      }),
      { kind: "clear" }
    )
  })

  it("keeps the loaded user on a token refresh", () => {
    assert.deepEqual(
      resolveAuthStateChangeDecision({
        event: "TOKEN_REFRESHED",
        session: SESSION,
        currentUser: USER_WITH_PROFILE,
      }),
      { kind: "keep-session", session: SESSION, user: USER_WITH_PROFILE }
    )
  })

  it("hydrates again on a token refresh without a loaded profile", () => {
    assert.deepEqual(
      resolveAuthStateChangeDecision({
        event: "TOKEN_REFRESHED",
        session: SESSION,
        currentUser: { profile: null },
      }),
      { kind: "establish-session", session: SESSION }
    )
  })

  it("establishes the session on any other event with a session", () => {
    assert.deepEqual(
      resolveAuthStateChangeDecision({
        event: "SIGNED_IN",
        session: SESSION,
        currentUser: null,
      }),
      { kind: "establish-session", session: SESSION }
    )
  })
})
