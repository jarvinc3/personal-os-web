import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_PLANNING_TAB,
  isPlanningTab,
  nextPlanningTab,
  PLANNING_TAB_ITEMS,
  planningTabItem,
  planningTabLabel,
  type PlanningTab,
} from "./planning-tabs.ts"

describe("nextPlanningTab", () => {
  it("walks the four tabs in display order and wraps around", () => {
    const visited = PLANNING_TAB_ITEMS.map((item) =>
      nextPlanningTab(item.value)
    )

    assert.deepEqual(visited, [
      "budgets",
      "receivables",
      "loans",
      DEFAULT_PLANNING_TAB,
    ])
  })

  it("throws for an unknown value", () => {
    assert.throws(
      () => nextPlanningTab("unknown" as PlanningTab),
      /Unknown planning tab: unknown/
    )
  })
})

describe("isPlanningTab", () => {
  it("accepts the four tabs and rejects anything else", () => {
    for (const item of PLANNING_TAB_ITEMS) {
      assert.equal(isPlanningTab(item.value), true)
    }

    assert.equal(isPlanningTab("accounts"), false)
    assert.equal(isPlanningTab(null), false)
  })
})

describe("planningTabItem", () => {
  it("throws for an unknown value", () => {
    assert.throws(
      () => planningTabItem("unknown" as PlanningTab),
      /Unknown planning tab: unknown/
    )
  })
})

describe("planningTabLabel", () => {
  it("joins the tab name and the figure it shows", () => {
    assert.equal(planningTabLabel("savings"), "Ahorros · Ahorrado")
    assert.equal(planningTabLabel("budgets"), "Presupuestos · Gastado")
    assert.equal(planningTabLabel("receivables"), "Cobros · Por cobrar")
    assert.equal(planningTabLabel("loans"), "Préstamos · Saldo pendiente")
  })
})
