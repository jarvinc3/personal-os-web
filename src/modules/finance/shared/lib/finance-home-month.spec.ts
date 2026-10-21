import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { expenseTrend } from "./finance-home-month.ts"

describe("expenseTrend", () => {
  it("returns null when the previous month has no expenses", () => {
    assert.equal(
      expenseTrend({
        currentExpenses: "100",
        previousExpenses: "0",
        locale: "en-US",
      }),
      null
    )
  })

  it("returns null when an amount is not a number", () => {
    assert.equal(
      expenseTrend({
        currentExpenses: "no-number",
        previousExpenses: "100",
        locale: "en-US",
      }),
      null
    )
    assert.equal(
      expenseTrend({
        currentExpenses: "100",
        previousExpenses: "no-number",
        locale: "en-US",
      }),
      null
    )
  })

  it("marks a small decrease as down and success", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "80",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "-20.0%",
        direction: "down",
        tone: "success",
      }
    )
  })

  it("marks a 30 percent decrease as down and danger", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "70",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "-30.0%",
        direction: "down",
        tone: "danger",
      }
    )
  })

  it("marks a larger decrease as down and danger", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "19",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "-81.0%",
        direction: "down",
        tone: "danger",
      }
    )
  })

  it("marks an increase as up and warning", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "150",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "+50.0%",
        direction: "up",
        tone: "warning",
      }
    )
  })

  it("formats a decimal increase to one decimal place", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "112.5",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "+12.5%",
        direction: "up",
        tone: "warning",
      }
    )
  })

  it("formats a decimal decrease to one decimal place", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "87.5",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "-12.5%",
        direction: "down",
        tone: "success",
      }
    )
  })

  it("marks a change that rounds to zero as flat", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "100.04",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "0%",
        direction: "flat",
        tone: "neutral",
      }
    )
  })

  it("marks an equal amount as flat and neutral", () => {
    assert.deepEqual(
      expenseTrend({
        currentExpenses: "100",
        previousExpenses: "100",
        locale: "en-US",
      }),
      {
        label: "0%",
        direction: "flat",
        tone: "neutral",
      }
    )
  })
})
