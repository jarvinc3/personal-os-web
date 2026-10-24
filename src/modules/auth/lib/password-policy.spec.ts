import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { PASSWORD_MIN_LENGTH, passwordPolicySchema } from "./password-policy.ts"

describe("passwordPolicySchema", () => {
  it("accepts a password that meets the Supabase policy", () => {
    assert.equal(passwordPolicySchema.safeParse("Password12").success, true)
  })

  it("accepts a password exactly as long as the policy", () => {
    const passwordAtMinLength = "Pass1".padEnd(PASSWORD_MIN_LENGTH, "a")
    assert.equal(passwordAtMinLength.length, PASSWORD_MIN_LENGTH)
    assert.equal(
      passwordPolicySchema.safeParse(passwordAtMinLength).success,
      true
    )
  })

  it("rejects a password shorter than the policy", () => {
    const passwordBelowMinLength = "Pass1".padEnd(PASSWORD_MIN_LENGTH - 1, "a")
    assert.equal(passwordBelowMinLength.length, PASSWORD_MIN_LENGTH - 1)
    assert.equal(
      passwordPolicySchema.safeParse(passwordBelowMinLength).success,
      false
    )
  })

  it("rejects a password without a lowercase letter", () => {
    assert.equal(passwordPolicySchema.safeParse("PASSWORD12").success, false)
  })

  it("rejects a password without an uppercase letter", () => {
    assert.equal(passwordPolicySchema.safeParse("password12").success, false)
  })

  it("rejects a password without a digit", () => {
    assert.equal(passwordPolicySchema.safeParse("PasswordWord").success, false)
  })
})
