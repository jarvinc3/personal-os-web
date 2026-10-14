import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  billingCycleLabel,
  subscriptionStatusVariant,
} from "./subscription-display.ts"

describe("billingCycleLabel", () => {
  it("labels the cycle and the interval", () => {
    assert.equal(billingCycleLabel("MONTHLY", 1), "Mensual")
    assert.equal(billingCycleLabel("MONTHLY", 2), "Mensual cada 2")
    assert.equal(billingCycleLabel("YEARLY", 1), "Anual")
  })
})

describe("subscriptionStatusVariant", () => {
  it("maps each status to a badge variant", () => {
    assert.equal(subscriptionStatusVariant("ACTIVE"), "success")
    assert.equal(subscriptionStatusVariant("PAUSED"), "warning")
    assert.equal(subscriptionStatusVariant("CANCELLED"), "secondary")
  })
})
