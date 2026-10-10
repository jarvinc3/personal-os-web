import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { withTabQuery } from "./tab-query.ts"

describe("withTabQuery", () => {
  it("adds the tab and keeps the other params", () => {
    assert.equal(
      withTabQuery("/finance/accounts/institutions/1", "sheet=account", "tab", "cards"),
      "/finance/accounts/institutions/1?sheet=account&tab=cards",
    )
  })

  it("returns null when the tab is already in the query", () => {
    assert.equal(
      withTabQuery("/finance/planning", "tab=loans", "tab", "loans"),
      null,
    )
  })

  it("replaces a previous tab value", () => {
    assert.equal(
      withTabQuery("/finance/planning", "tab=savings", "tab", "loans"),
      "/finance/planning?tab=loans",
    )
  })
})
