import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveReauthConfirmMode } from "./wipe-confirm.ts"

describe("resolveReauthConfirmMode", () => {
  it("keeps a confirm action visible while providers are still unknown", () => {
    assert.equal(
      resolveReauthConfirmMode({
        isLoadingProviders: true,
        canConfirmInApp: null,
        isGoogleOnly: false,
      }),
      "pending"
    )
    assert.equal(
      resolveReauthConfirmMode({
        isLoadingProviders: false,
        canConfirmInApp: null,
        isGoogleOnly: false,
      }),
      "pending"
    )
  })

  it("asks for the password when the account has email login", () => {
    assert.equal(
      resolveReauthConfirmMode({
        isLoadingProviders: false,
        canConfirmInApp: true,
        isGoogleOnly: false,
      }),
      "password"
    )
  })

  it("sends Google-only accounts through Google", () => {
    assert.equal(
      resolveReauthConfirmMode({
        isLoadingProviders: false,
        canConfirmInApp: false,
        isGoogleOnly: true,
      }),
      "google"
    )
  })

  it("reports when neither password nor Google can confirm", () => {
    assert.equal(
      resolveReauthConfirmMode({
        isLoadingProviders: false,
        canConfirmInApp: false,
        isGoogleOnly: false,
      }),
      "unavailable"
    )
  })
})
