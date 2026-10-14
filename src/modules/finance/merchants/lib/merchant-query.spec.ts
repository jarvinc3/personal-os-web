import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { merchantMonthParams } from "./merchant-query.ts"

describe("merchantMonthParams", () => {
  it("returns the first and last day of the current month", () => {
    assert.deepEqual(merchantMonthParams(new Date(2026, 9, 14)), {
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
    })
  })

  it("handles a february window", () => {
    assert.deepEqual(merchantMonthParams(new Date(2026, 1, 3)), {
      dateFrom: "2026-02-01",
      dateTo: "2026-02-28",
    })
  })
})
