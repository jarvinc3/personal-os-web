import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveEmailSyncRefetchInterval } from "./email-sync-polling.ts"

const CONNECTED = {
  connected: true,
  initialSyncCompletedAt: "2026-01-02T00:00:00.000Z",
  syncInProgress: false,
  syncProgress: null,
} as const

describe("resolveEmailSyncRefetchInterval", () => {
  it("stops polling before the dashboard arrives", () => {
    assert.equal(resolveEmailSyncRefetchInterval(undefined), false)
  })

  it("stops polling when Gmail is not connected", () => {
    assert.equal(
      resolveEmailSyncRefetchInterval({
        ...CONNECTED,
        connected: false,
      }),
      false
    )
  })

  it("retries every 30 seconds after a sync error code", () => {
    assert.equal(
      resolveEmailSyncRefetchInterval({
        ...CONNECTED,
        lastSyncErrorCode: "GMAIL_REAUTH_REQUIRED",
      }),
      30_000
    )
  })

  it("retries every 30 seconds after a failed progress", () => {
    assert.equal(
      resolveEmailSyncRefetchInterval({
        ...CONNECTED,
        syncProgress: { status: "failed" },
      }),
      30_000
    )
  })

  it("retries every 30 seconds when a scheduled run failed to classify", () => {
    assert.equal(
      resolveEmailSyncRefetchInterval({
        ...CONNECTED,
        syncProgress: {
          status: "scheduled",
          errorCode: "classification_failed",
        },
      }),
      30_000
    )
  })

  it("follows an active sync every 5 seconds", () => {
    assert.equal(
      resolveEmailSyncRefetchInterval({
        ...CONNECTED,
        syncInProgress: true,
      }),
      5_000
    )
  })

  it("follows the first import until it completes", () => {
    assert.equal(
      resolveEmailSyncRefetchInterval({
        ...CONNECTED,
        initialSyncCompletedAt: null,
      }),
      5_000
    )
  })

  it("stops polling once the first import completed in peace", () => {
    assert.equal(resolveEmailSyncRefetchInterval(CONNECTED), false)
  })
})
