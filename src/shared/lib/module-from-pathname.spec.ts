import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { moduleSlugFromPathname } from "./module-from-pathname.ts"

describe("moduleSlugFromPathname", () => {
  it("returns finance for finance routes including secondary views", () => {
    assert.equal(moduleSlugFromPathname("/finance"), "finance")
    assert.equal(moduleSlugFromPathname("/finance/transactions"), "finance")
    assert.equal(moduleSlugFromPathname("/finance/overview"), "finance")
    assert.equal(moduleSlugFromPathname("/finance/transfers/new"), "finance")
  })

  it("returns null on settings and unrelated routes", () => {
    assert.equal(moduleSlugFromPathname("/settings"), null)
    assert.equal(moduleSlugFromPathname("/settings/finance"), null)
    assert.equal(moduleSlugFromPathname("/home"), null)
  })
})
