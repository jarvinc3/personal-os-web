import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { emailSourceSchema } from "./email-source-form.ts"

const validSource = {
  institutionId: "inst-1",
  bankSenderEmail: "bank@example.com",
  extraSenders: "",
  label: "",
}

describe("emailSourceSchema", () => {
  it("accepts a valid sender email", () => {
    assert.equal(emailSourceSchema.safeParse(validSource).success, true)
  })

  it("rejects an invalid sender email", () => {
    assert.equal(
      emailSourceSchema.safeParse({ ...validSource, bankSenderEmail: "nope" })
        .success,
      false
    )
  })
})
