import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { editAccountSchema } from "./edit-account-form.ts"

describe("editAccountSchema", () => {
  it("accepts a name of two or more characters", () => {
    assert.equal(editAccountSchema.safeParse({ fullName: "Ana" }).success, true)
  })

  it("rejects a one-character name", () => {
    assert.equal(editAccountSchema.safeParse({ fullName: "A" }).success, false)
  })
})
