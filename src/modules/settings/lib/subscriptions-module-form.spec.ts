import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { subscriptionsModuleSchema } from "./subscriptions-module-form.ts"

const validSubscriptions = {
  defaultCurrency: "EUR",
  groupBy: "category" as const,
  renewalReminders: true,
  priceIncreaseAlerts: true,
}

describe("subscriptionsModuleSchema", () => {
  it("accepts a valid subscriptions config", () => {
    assert.equal(
      subscriptionsModuleSchema.safeParse(validSubscriptions).success,
      true
    )
  })

  it("rejects a currency shorter than three characters", () => {
    assert.equal(
      subscriptionsModuleSchema.safeParse({
        ...validSubscriptions,
        defaultCurrency: "EU",
      }).success,
      false
    )
  })
})
