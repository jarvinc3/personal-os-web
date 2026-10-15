import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CHART_PALETTE, chartConfig, chartPoints } from "./chat-chart-data.ts"

describe("chartPoints", () => {
  it("keeps the series order and turns values into numbers", () => {
    const points = chartPoints([
      { label: "Comida", value: "120.50" },
      { label: "Transporte", value: "80" },
    ])

    assert.deepEqual(points, [
      { label: "Comida", value: 120.5, color: CHART_PALETTE[0] },
      { label: "Transporte", value: 80, color: CHART_PALETTE[1] },
    ])
  })

  it("uses the color sent by the agent", () => {
    const [point] = chartPoints([
      { label: "Comida", value: "10", color: "#123456" },
    ])

    assert.equal(point.color, "#123456")
  })

  it("turns a non-numeric value into zero", () => {
    const [point] = chartPoints([{ label: "Otro", value: "n/a" }])

    assert.equal(point.value, 0)
  })

  it("wraps the palette when there are more points than colors", () => {
    const points = chartPoints(
      Array.from({ length: CHART_PALETTE.length + 1 }, (_, index) => ({
        label: `P${index}`,
        value: "1",
      }))
    )

    assert.equal(points.at(-1)?.color, CHART_PALETTE[0])
  })
})

describe("chartConfig", () => {
  it("labels the series with the chart title", () => {
    assert.deepEqual(chartConfig("Gasto por categoría"), {
      value: { label: "Gasto por categoría", color: CHART_PALETTE[0] },
    })
  })

  it("falls back to a generic label", () => {
    assert.equal(chartConfig(undefined).value.label, "Monto")
  })
})
