import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { cardUtilization } from "./card-utilization.ts"

describe("cardUtilization", () => {
  it("uses part of the limit when there is debt left", () => {
    const utilization = cardUtilization({ available: 3000, creditLimit: 10000 })
    assert.ok(utilization !== null)
    assert.equal(utilization.debt, 7000)
    assert.equal(utilization.utilizationPct, 70)
    assert.equal(utilization.overdraft, 0)
  })

  it("goes past 100% when the card owes more than its limit", () => {
    const utilization = cardUtilization({
      available: -2500.5,
      creditLimit: 10000,
    })
    assert.ok(utilization !== null)
    assert.equal(utilization.debt, 12500.5)
    assert.ok(Math.abs(utilization.utilizationPct - 125.005) < 1e-9)
    assert.equal(utilization.overdraft, 2500.5)
  })

  it("reports no debt when the card is fully available", () => {
    const utilization = cardUtilization({
      available: 10000,
      creditLimit: 10000,
    })
    assert.ok(utilization !== null)
    assert.equal(utilization.utilizationPct, 0)
  })

  it("returns null without a usable limit", () => {
    assert.equal(cardUtilization({ available: 0, creditLimit: 0 }), null)
    assert.equal(cardUtilization({ available: 500, creditLimit: -1 }), null)
  })
})
