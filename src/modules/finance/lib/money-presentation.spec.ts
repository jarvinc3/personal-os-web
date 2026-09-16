import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

const financeRoot = join(dirname(fileURLToPath(import.meta.url)), "..")

function financeSource(path: string): string {
  return readFileSync(join(financeRoot, path), "utf8")
}

describe("finance money presentations", () => {
  it("does not render known raw amount expressions", () => {
    const sources = [
      financeSource("components/catalog/card-balance-sheet.tsx"),
      financeSource("components/catalog/account-sheet.tsx"),
      financeSource("components/accounts/finance-mailboxes-view.tsx"),
      financeSource("components/sync/assign-email-message-sheet.tsx"),
    ].join("\n")

    assert.equal(sources.includes("{item.balance}"), false)
    assert.equal(sources.includes("${created.balance}"), false)
    assert.equal(
      sources.includes("${payload.amount} ${payload.currency"),
      false,
    )
    assert.equal(
      sources.includes("${extracted.amount} ${extracted.currency"),
      false,
    )
  })
})
