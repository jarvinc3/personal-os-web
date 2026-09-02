import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildGmailOAuthReturnTo,
  buildGoogleOAuthUrlSearch,
  financeAppOrigin,
  isAppReturnTo,
  parseOAuthSuccessParam,
  syncFailureReason,
} from "./gmail-oauth.ts"

describe("Gmail OAuth returnTo", () => {
  it("uses NEXT_PUBLIC_URL origin (local :3000, never Vite :5173)", () => {
    const previous = process.env.NEXT_PUBLIC_URL
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000"
    try {
      assert.equal(financeAppOrigin(), "http://localhost:3000")
      assert.equal(
        buildGmailOAuthReturnTo(),
        "http://localhost:3000/finance/sync/oauth",
      )
      assert.equal(buildGmailOAuthReturnTo().includes(":5173"), false)
    } finally {
      process.env.NEXT_PUBLIC_URL = previous
    }
  })

  it("rejects a foreign origin as returnTo", () => {
    const previous = process.env.NEXT_PUBLIC_URL
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000"
    try {
      assert.equal(isAppReturnTo("https://evil.example/phish"), false)
      assert.equal(
        isAppReturnTo("http://localhost:3000/finance/sync/oauth"),
        true,
      )
    } finally {
      process.env.NEXT_PUBLIC_URL = previous
    }
  })
})

describe("buildGoogleOAuthUrlSearch", () => {
  const accountId = "11111111-1111-1111-1111-111111111111"
  const cardId = "22222222-2222-2222-2222-222222222222"

  it("rejects accountId and cardId together (xor)", () => {
    const result = buildGoogleOAuthUrlSearch({ accountId, cardId })
    assert.equal(result.ok, false)
  })

  it("puts only the app returnTo on the query (no open redirect)", () => {
    const previous = process.env.NEXT_PUBLIC_URL
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000"
    try {
      const result = buildGoogleOAuthUrlSearch({ accountId })
      assert.equal(result.ok, true)
      if (!result.ok) return
      const params = new URLSearchParams(result.body)
      assert.equal(params.get("accountId"), accountId)
      assert.equal(params.get("cardId"), null)
      const returnTo = params.get("returnTo")
      assert.ok(returnTo)
      assert.equal(new URL(returnTo).origin, "http://localhost:3000")
      assert.equal(returnTo.includes("evil"), false)
    } finally {
      process.env.NEXT_PUBLIC_URL = previous
    }
  })
})

describe("parseOAuthSuccessParam", () => {
  it("maps false to an explicit error (not a silent empty)", () => {
    assert.equal(parseOAuthSuccessParam("false"), "error")
    assert.equal(parseOAuthSuccessParam("true"), "ok")
    assert.equal(parseOAuthSuccessParam(null), "none")
  })
})

describe("syncFailureReason", () => {
  it("surfaces queued:false reason", () => {
    assert.equal(
      syncFailureReason({
        queued: false,
        reason: "gmail-sync queue is unavailable",
      }),
      "gmail-sync queue is unavailable",
    )
    assert.equal(syncFailureReason({ queued: true }), null)
  })
})
