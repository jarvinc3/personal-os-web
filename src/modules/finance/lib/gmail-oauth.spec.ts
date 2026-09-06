import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildGmailOAuthReturnTo,
  buildGoogleOAuthUrlSearch,
  financeAppOrigin,
  isAppReturnTo,
  parseOAuthNextPath,
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
        "http://localhost:3000/finance/sync/oauth?next=%2Ffinance%2Fsync",
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
  const institutionId = "11111111-1111-1111-1111-111111111111"

  it("rejects a missing institution", () => {
    const result = buildGoogleOAuthUrlSearch({ bankDomain: "bhd.com.do" })
    assert.equal(result.ok, false)
  })

  it("puts only the app returnTo on the query (no open redirect)", () => {
    const previous = process.env.NEXT_PUBLIC_URL
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000"
    try {
      const result = buildGoogleOAuthUrlSearch({
        institutionId,
        nextPath: "/finance/accounts",
      })
      assert.equal(result.ok, true)
      if (!result.ok) return
      const params = new URLSearchParams(result.body)
      assert.equal(params.get("institutionId"), institutionId)
      assert.equal(params.get("accountId"), null)
      const returnTo = params.get("returnTo")
      assert.ok(returnTo)
      assert.equal(new URL(returnTo).origin, "http://localhost:3000")
      assert.equal(new URL(returnTo).searchParams.get("next"), "/finance/accounts")
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

describe("parseOAuthNextPath", () => {
  it("falls back to sync for unknown paths", () => {
    assert.equal(parseOAuthNextPath("/finance/accounts"), "/finance/accounts")
    assert.equal(parseOAuthNextPath("/evil"), "/finance/sync")
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
