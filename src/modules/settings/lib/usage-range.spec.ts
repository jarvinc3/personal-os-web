import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  resolveUsageChartSeries,
  resolveUsageRangeDays,
} from "./usage-range.ts"

describe("resolveUsageRangeDays", () => {
  it("accepts the three ranges of the filter", () => {
    assert.equal(resolveUsageRangeDays("1"), 1)
    assert.equal(resolveUsageRangeDays("7"), 7)
    assert.equal(resolveUsageRangeDays("30"), 30)
  })

  it("rejects a range the API does not know", () => {
    assert.equal(resolveUsageRangeDays("3"), null)
    assert.equal(resolveUsageRangeDays("0"), null)
    assert.equal(resolveUsageRangeDays("abc"), null)
  })
})

describe("resolveUsageChartSeries", () => {
  it("returns empty series while the summary is missing", () => {
    assert.deepEqual(resolveUsageChartSeries(undefined), {
      daily: [],
      hourly: [],
    })
  })

  it("fills the days between the server pair of dates", () => {
    const series = resolveUsageChartSeries({
      range: {
        days: 3,
        from: "2026-11-17T00:00:00.000Z",
        to: "2026-11-19T12:30:00.000Z",
      },
      byDay: [],
      byHour: [],
    })

    assert.deepEqual(
      series.daily.map((bucket) => bucket.day),
      ["2026-11-17", "2026-11-18", "2026-11-19"]
    )
    assert.equal(series.hourly.length, 24)
  })

  it("keeps the day and hour buckets that already have data", () => {
    const series = resolveUsageChartSeries({
      range: {
        days: 2,
        from: "2026-11-18T00:00:00.000Z",
        to: "2026-11-19T00:00:00.000Z",
      },
      byDay: [
        {
          day: "2026-11-18",
          calls: 2,
          inputTokens: 100,
          outputTokens: 20,
          costUsd: 0.0004,
        },
      ],
      byHour: [
        {
          hour: 9,
          calls: 2,
          inputTokens: 100,
          outputTokens: 20,
          costUsd: 0.0004,
        },
      ],
    })

    assert.equal(series.daily[0].calls, 2)
    assert.equal(series.daily[1].calls, 0)
    assert.equal(series.hourly[9].calls, 2)
    assert.equal(series.hourly[0].calls, 0)
  })
})
