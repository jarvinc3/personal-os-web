import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  isPlanningTab,
  PLANNING_TAB_ITEMS,
  planningTabItem,
  planningTabLabel,
  type PlanningTab,
} from "./planning-tabs.ts"

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
