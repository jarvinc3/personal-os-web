import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  mapSpendingBucketsToChart,
  mapSpendingPointsToChart,
} from "./chart-series.ts"

describe("mapSpendingBucketsToChart", () => {
  it("uses Sin categoría when categoryId is null and skips NaN totals", () => {
    const rows = mapSpendingBucketsToChart([
      {
        categoryId: null,
        name: "Otros",
        color: null,
        icon: "🛒",
        total: "12.50",
      },
      {
        categoryId: "x",
        name: "Bad",
        color: null,
        icon: null,
        total: "nope",
      },
    ])
    assert.equal(rows.length, 1)
    assert.equal(rows[0]?.key, "uncategorized")
    assert.equal(rows[0]?.label, "🛒 Sin categoría")
    assert.equal(rows[0]?.total, 12.5)
  })
})

describe("mapSpendingPointsToChart", () => {
  it("reads points and ignores a root array payload", () => {
    const fromPoints = mapSpendingPointsToChart({
      points: [
        { date: "2026-08-01", expenses: "10", income: "2" },
        { date: "2026-08-02", expenses: "abc", income: "1" },
      ],
    })
    assert.equal(fromPoints.length, 1)
    assert.equal(fromPoints[0]?.expenses, 10)
    assert.equal(fromPoints[0]?.income, 2)

    const notArray = mapSpendingPointsToChart(
      // @ts-expect-error — the API root is { points }, not an array
      [{ date: "2026-08-01", expenses: "10", income: "0" }],
    )
    assert.deepEqual(notArray, [])
  })
})
