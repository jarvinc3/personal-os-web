import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { expenseTrend } from "./finance-home-month.ts"

describe("expenseTrend", () => {
  it("returns null when the previous month has no expenses", () => {
    assert.equal(expenseTrend("100", "0"), null)
  })

  it("returns null when an amount is not a number", () => {
    assert.equal(expenseTrend("no-number", "100"), null)
    assert.equal(expenseTrend("100", "no-number"), null)
  })

  it("marks a small decrease as down and success", () => {
    assert.deepEqual(expenseTrend("80", "100"), {
      label: "-20.0%",
      direction: "down",
      tone: "success",
    })
  })

  it("marks a 30 percent decrease as down and danger", () => {
    assert.deepEqual(expenseTrend("70", "100"), {
      label: "-30.0%",
      direction: "down",
      tone: "danger",
    })
  })

  it("marks a larger decrease as down and danger", () => {
    assert.deepEqual(expenseTrend("19", "100"), {
      label: "-81.0%",
      direction: "down",
      tone: "danger",
    })
  })

  it("marks an increase as up and warning", () => {
    assert.deepEqual(expenseTrend("150", "100"), {
      label: "+50.0%",
      direction: "up",
      tone: "warning",
    })
  })

  it("formats a decimal increase to one decimal place", () => {
    assert.deepEqual(expenseTrend("112.5", "100"), {
      label: "+12.5%",
      direction: "up",
      tone: "warning",
    })
  })

  it("formats a decimal decrease to one decimal place", () => {
    assert.deepEqual(expenseTrend("87.5", "100"), {
      label: "-12.5%",
      direction: "down",
      tone: "success",
    })
  })

  it("marks a change that rounds to zero as flat", () => {
    assert.deepEqual(expenseTrend("100.04", "100"), {
      label: "0%",
      direction: "flat",
      tone: "neutral",
    })
  })

  it("marks an equal amount as flat and neutral", () => {
    assert.deepEqual(expenseTrend("100", "100"), {
      label: "0%",
      direction: "flat",
      tone: "neutral",
    })
  })
})
