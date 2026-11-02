import assert from "node:assert/strict"
import test from "node:test"
import { shouldReturnToTransactionOnMessageClose } from "./message-return.ts"

test("returns to the transaction when closing a linked message sheet", () => {
  assert.equal(
    shouldReturnToTransactionOnMessageClose(
      false,
      "ea10b793-8239-5366-abb5-6743c01a3f8f"
    ),
    true
  )
})

test("keeps normal message-sheet opening and closing in Intelligence", () => {
  assert.equal(shouldReturnToTransactionOnMessageClose(false, null), false)
  assert.equal(
    shouldReturnToTransactionOnMessageClose(false, "not-a-transaction-id"),
    false
  )
  assert.equal(
    shouldReturnToTransactionOnMessageClose(
      true,
      "ea10b793-8239-5366-abb5-6743c01a3f8f"
    ),
    false
  )
})
