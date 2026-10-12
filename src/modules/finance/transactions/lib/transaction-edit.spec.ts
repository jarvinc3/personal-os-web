import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canEditTransaction,
  canUnlockTransaction,
  isTransactionMetadataOnly,
  isTransactionReadOnly,
} from "./transaction-edit.ts"

describe("transaction editability", () => {
  it("edits full and metadata movements only", () => {
    assert.equal(canEditTransaction({ editable: "FULL" }), true)
    assert.equal(canEditTransaction({ editable: "METADATA" }), true)
    assert.equal(canEditTransaction({ editable: "NOTES" }), false)
    assert.equal(canEditTransaction({ editable: "NONE" }), false)
  })

  it("unlocks only completed movements", () => {
    assert.equal(canUnlockTransaction({ editable: "METADATA" }), true)
    assert.equal(canUnlockTransaction({ editable: "FULL" }), false)
    assert.equal(canUnlockTransaction({ editable: "NOTES" }), false)
  })

  it("flags metadata-only and read-only movements", () => {
    assert.equal(isTransactionMetadataOnly({ editable: "METADATA" }), true)
    assert.equal(isTransactionMetadataOnly({ editable: "FULL" }), false)
    assert.equal(isTransactionReadOnly({ editable: "NOTES" }), true)
    assert.equal(isTransactionReadOnly({ editable: "NONE" }), true)
    assert.equal(isTransactionReadOnly({ editable: "FULL" }), false)
  })
})
