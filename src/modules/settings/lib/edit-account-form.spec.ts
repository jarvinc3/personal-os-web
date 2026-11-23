import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { buildProfilePatch, editAccountSchema } from "./edit-account-form.ts"

describe("editAccountSchema", () => {
  it("accepts a name of two or more characters", () => {
    assert.equal(editAccountSchema.safeParse({ fullName: "Ana" }).success, true)
  })

  it("rejects a one-character name", () => {
    assert.equal(editAccountSchema.safeParse({ fullName: "A" }).success, false)
  })
})

describe("buildProfilePatch", () => {
  const saved = {
    savedFullName: "Ana",
    selectedAvatarUrl: "",
    isAvatarDirty: false,
  }

  it("returns an empty patch when nothing changed", () => {
    assert.deepEqual(
      buildProfilePatch({
        ...saved,
        values: { fullName: "Ana" },
      }),
      {}
    )
  })

  it("sends the name only when it changed", () => {
    assert.deepEqual(
      buildProfilePatch({
        ...saved,
        values: { fullName: "Ana María" },
      }),
      { fullName: "Ana María" }
    )
  })

  it("sends the avatar only when it changed and has a value", () => {
    assert.deepEqual(
      buildProfilePatch({
        ...saved,
        values: { fullName: "Ana" },
        selectedAvatarUrl: "https://cdn.test/avatar.png",
        isAvatarDirty: true,
      }),
      { avatarUrl: "https://cdn.test/avatar.png" }
    )
    assert.deepEqual(
      buildProfilePatch({
        ...saved,
        values: { fullName: "Ana" },
        isAvatarDirty: true,
      }),
      {}
    )
  })
})
