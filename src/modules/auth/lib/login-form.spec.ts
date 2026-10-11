import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { loginFormSchema } from "./login-form.ts"

describe("loginFormSchema", () => {
  it("accepts an email and a strong password", () => {
    assert.equal(
      loginFormSchema.safeParse({
        email: "ana@example.com",
        password: "Password1",
      }).success,
      true
    )
  })

  it("rejects a password without an uppercase letter", () => {
    assert.equal(
      loginFormSchema.safeParse({
        email: "ana@example.com",
        password: "password1",
      }).success,
      false
    )
  })
})
