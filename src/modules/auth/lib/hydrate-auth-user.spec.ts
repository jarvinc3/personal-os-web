import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { AuthUser } from "@/src/modules/auth/types/auth.types"
import type { UserProfile } from "@/src/modules/settings"

process.env.NEXT_PUBLIC_API_URL = "http://api.test"

const {
  BackendProfileUnavailableError,
  mergeAuthUserWithProfile,
  resolveProfileFailure,
} = await import("@/src/modules/auth/lib/hydrate-auth-user")
const { ApiError } = await import("@/src/config/api-client.utils")

function buildProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "user-1",
    email: "profile@example.com",
    fullName: "Profile Name",
    avatarUrl: "https://cdn.test/avatar.png",
    timezone: null,
    locale: null,
    preferences: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "user-1",
    email: "session@example.com",
    fullName: "Session Name",
    avatarUrl: "https://cdn.test/session.png",
    profile: null,
    ...overrides,
  }
}

describe("mergeAuthUserWithProfile", () => {
  it("takes the profile data and keeps the session id", () => {
    const merged = mergeAuthUserWithProfile(buildUser(), buildProfile())

    assert.equal(merged.id, "user-1")
    assert.equal(merged.email, "profile@example.com")
    assert.equal(merged.fullName, "Profile Name")
    assert.equal(merged.avatarUrl, "https://cdn.test/avatar.png")
  })

  it("falls back to the session data when the profile fields are empty", () => {
    const merged = mergeAuthUserWithProfile(
      buildUser(),
      buildProfile({ fullName: null, avatarUrl: null })
    )

    assert.equal(merged.fullName, "Session Name")
    assert.equal(merged.avatarUrl, "https://cdn.test/session.png")
  })

  it("leaves the avatar undefined when neither source has one", () => {
    const merged = mergeAuthUserWithProfile(
      buildUser({ avatarUrl: undefined }),
      buildProfile({ avatarUrl: null })
    )

    assert.equal(merged.avatarUrl, undefined)
  })
})

describe("resolveProfileFailure", () => {
  it("returns the same error when it is already a profile failure", () => {
    const original = new BackendProfileUnavailableError("x")

    assert.equal(resolveProfileFailure(original), original)
  })

  it("explains a missing backend account on 404", () => {
    const failure = resolveProfileFailure(new ApiError(404, "not found"))

    assert.ok(failure instanceof BackendProfileUnavailableError)
    assert.match(failure.message, /no está registrada/)
  })

  it("points to the server on 5xx", () => {
    const failure = resolveProfileFailure(new ApiError(500, "boom"))

    assert.match(failure.message, /servidor no está disponible/)
  })

  it("keeps the API message on other client errors", () => {
    const failure = resolveProfileFailure(new ApiError(400, "Datos inválidos"))

    assert.equal(failure.message, "Datos inválidos")
  })

  it("reports a connection problem when the error is not an API error", () => {
    const failure = resolveProfileFailure(new Error("fetch failed"))

    assert.match(failure.message, /No se pudo conectar con el servidor/)
  })
})
