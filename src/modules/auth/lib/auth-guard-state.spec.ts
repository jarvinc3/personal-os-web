import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveAuthGuardState } from "@/src/modules/auth/lib/auth-guard-state"
import type { AuthUser } from "@/src/modules/auth/types/auth.types"
import type { UserProfile } from "@/src/modules/settings"

function buildProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "user-1",
    email: "user@example.com",
    fullName: "User",
    avatarUrl: null,
    timezone: null,
    locale: null,
    preferences: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

function buildUser(profile: UserProfile | null): AuthUser {
  return {
    id: "user-1",
    email: "user@example.com",
    fullName: "User",
    profile,
  }
}

describe("resolveAuthGuardState", () => {
  it("stays loading until the bootstrap finishes", () => {
    assert.deepEqual(
      resolveAuthGuardState({ bootstrapped: false, user: null }),
      { isLoading: true, isAuthenticated: false, user: null }
    )
  })

  it("is authenticated when the user has a profile", () => {
    const user = buildUser(buildProfile())

    assert.deepEqual(resolveAuthGuardState({ bootstrapped: true, user }), {
      isLoading: false,
      isAuthenticated: true,
      user,
    })
  })

  it("is not authenticated when the user has no profile", () => {
    const user = buildUser(null)

    assert.deepEqual(resolveAuthGuardState({ bootstrapped: true, user }), {
      isLoading: false,
      isAuthenticated: false,
      user,
    })
  })
})
