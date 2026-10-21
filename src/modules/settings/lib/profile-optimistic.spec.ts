import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { UserProfile } from "@/src/modules/settings/types/profile.types"
import { applyProfilePatch } from "./profile-optimistic.ts"

const PROFILE = {
  id: "u-1",
  email: "ana@example.com",
  fullName: "Ana",
  avatarUrl: "https://cdn.example.com/ana.png",
  timezone: "America/Santo_Domingo",
  locale: "es-DO",
  preferences: null,
  lastSeenReleaseVersion: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as UserProfile

describe("applyProfilePatch", () => {
  it("shows the new name before the server answers", () => {
    const next = applyProfilePatch(PROFILE, { fullName: "Ana Pérez" })

    assert.equal(next.fullName, "Ana Pérez")
    assert.equal(next.avatarUrl, PROFILE.avatarUrl)
  })

  it("shows the new avatar before the server answers", () => {
    const next = applyProfilePatch(PROFILE, {
      avatarUrl: "https://cdn.example.com/nueva.png",
    })

    assert.equal(next.avatarUrl, "https://cdn.example.com/nueva.png")
    assert.equal(next.fullName, PROFILE.fullName)
  })

  it("leaves the profile untouched for fields the patch does not send", () => {
    const next = applyProfilePatch(PROFILE, {})

    assert.deepEqual(next, PROFILE)
    assert.notEqual(next, PROFILE)
  })
})
