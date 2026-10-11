import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { healthModuleSchema } from "./health-module-form.ts"

const validHealth = {
  units: "metric" as const,
  dashboardPeriod: "month" as const,
  hideSensitiveMetrics: false,
  goalReminders: true,
  weeklySummary: true,
}

describe("healthModuleSchema", () => {
  it("accepts a valid health config", () => {
    assert.equal(healthModuleSchema.safeParse(validHealth).success, true)
  })

  it("rejects an unknown units value", () => {
    assert.equal(
      healthModuleSchema.safeParse({ ...validHealth, units: "stones" }).success,
      false
    )
  })
})
