import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { assignEmailMessageSchema } from "./assign-email-message-form.ts"

describe("assignEmailMessageSchema", () => {
  it("accepts a target", () => {
    assert.equal(
      assignEmailMessageSchema.safeParse({ target: "account:a1" }).success,
      true
    )
  })

  it("rejects an empty target", () => {
    assert.equal(
      assignEmailMessageSchema.safeParse({ target: "" }).success,
      false
    )
  })
})
