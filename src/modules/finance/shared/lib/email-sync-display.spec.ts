import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  countSkippedDuplicates,
  emailOutcomeLabel,
  hasRunningEmailSync,
  RUNNING_SYNC_REFETCH_MS,
  syncLogBadgeVariant,
  syncLogStatusLabel,
} from "./email-sync-display.ts"

describe("email sync display labels", () => {
  it("maps sync log statuses", () => {
    assert.equal(syncLogStatusLabel("SUCCESS"), "OK")
    assert.equal(syncLogStatusLabel("FAILED"), "Error")
    assert.equal(syncLogStatusLabel("RUNNING"), "En curso")
    assert.equal(syncLogBadgeVariant("FAILED"), "destructive")
  })

  it("polls mailboxes only while a sync log is RUNNING", () => {
    assert.equal(hasRunningEmailSync([]), false)
    assert.equal(
      hasRunningEmailSync([
        {
          sources: [{ logs: [{ status: "FAILED" }, { status: "SUCCESS" }] }],
        },
      ]),
      false
    )
    assert.equal(
      hasRunningEmailSync([
        {
          sources: [{ logs: [{ status: "RUNNING" }] }],
        },
      ]),
      true
    )
    assert.equal(RUNNING_SYNC_REFETCH_MS, 3_000)
  })

  it("maps extract outcomes", () => {
    assert.equal(emailOutcomeLabel("IMPORTED"), "Importado")
    assert.equal(emailOutcomeLabel("PENDING_ASSIGNMENT"), "Por asignar")
    assert.equal(emailOutcomeLabel("PENDING_AMOUNT"), "Falta el monto")
    assert.equal(emailOutcomeLabel("SKIPPED_NOT_TX"), "No es movimiento")
    assert.equal(emailOutcomeLabel("SKIPPED_DUPLICATE"), "Duplicado")
  })

  it("counts the messages the sync skipped as duplicates", () => {
    assert.equal(
      countSkippedDuplicates([
        { outcome: "IMPORTED" },
        { outcome: "SKIPPED_DUPLICATE" },
        { outcome: "SKIPPED_DUPLICATE" },
      ]),
      2
    )
  })
})
