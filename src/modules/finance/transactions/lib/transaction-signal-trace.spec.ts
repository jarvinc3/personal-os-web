import assert from "node:assert/strict"
import test from "node:test"
import {
  sourceEmailDetailHref,
  transactionSignalTrace,
} from "./transaction-signal-trace.ts"

test("reads signal and source email ids from movement AI metadata", () => {
  assert.deepEqual(
    transactionSignalTrace({
      signalId: "signal-123",
      sourceEmailMessageId: "message-456",
    }),
    { signalId: "signal-123", sourceEmailMessageId: "message-456" }
  )
})

test("returns an empty trace for missing or malformed metadata", () => {
  assert.deepEqual(transactionSignalTrace(undefined), {
    signalId: null,
    sourceEmailMessageId: null,
  })
  assert.deepEqual(
    transactionSignalTrace({ signalId: "  ", sourceEmailMessageId: 7 }),
    { signalId: null, sourceEmailMessageId: null }
  )
})

test("builds a URL to the source email detail sheet", () => {
  assert.equal(
    sourceEmailDetailHref("message/with space"),
    "/intelligence?sheet=intelligence-message&sheetId=message%2Fwith+space"
  )
})
