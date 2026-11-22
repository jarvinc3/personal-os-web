import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceBudget } from "@/src/modules/finance/shared/types/entities.ts"
import { budgetCardModel } from "./budget-card-model.ts"

const DISPLAY = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es",
}

const BUDGET: FinanceBudget = {
  id: "budget-1",
  name: "Comida",
  categoryId: "category-1",
  category: {
    id: "category-1",
    name: "Comida",
    icon: "icons/utensils",
    color: "#f97316",
  },
  periodType: "MONTHLY",
  periodStart: "2026-10-01",
  periodEnd: "2026-10-31",
  amountLimit: "10000",
  amountSpent: "4000",
  alertThresholdPct: 80,
}

describe("budgetCardModel", () => {
  it("takes the category name, icon and color", () => {
    const model = budgetCardModel(BUDGET, DISPLAY)

    assert.equal(model.title, "Comida")
    assert.equal(model.emoji, "icons/utensils")
    assert.equal(model.accentColor, "#f97316")
    assert.equal(model.progress, 40)
    assert.equal(model.tone, "info")
    assert.match(String(model.caption), /Quedan /)
  })

  it("warns at the alert threshold and flags an exceeded budget", () => {
    const warning = budgetCardModel({ ...BUDGET, amountSpent: "8500" }, DISPLAY)
    assert.equal(warning.tone, "warning")
    assert.equal(warning.badge.label, "Alerta")

    const exceeded = budgetCardModel(
      { ...BUDGET, amountSpent: "12000" },
      DISPLAY
    )
    assert.equal(exceeded.tone, "danger")
    assert.equal(exceeded.badge.label, "Excedido")
    assert.match(String(exceeded.caption), /^Excedido /)
  })

  it("prefers the category list over the single category", () => {
    const model = budgetCardModel(
      {
        ...BUDGET,
        categories: [
          { id: "category-2", name: "Transporte", icon: null, color: null },
          { id: "category-3", name: "Casa", icon: null, color: null },
        ],
      },
      DISPLAY
    )

    assert.equal(model.title, "Transporte, Casa")
  })

  it("falls back to the budget name when there is no category", () => {
    const model = budgetCardModel(
      { ...BUDGET, name: "General", category: null },
      DISPLAY
    )

    assert.equal(model.title, "General")
    assert.equal(model.emoji, undefined)
  })

  it("leaves progress empty when an amount is unreadable", () => {
    const model = budgetCardModel({ ...BUDGET, amountSpent: "nope" }, DISPLAY)

    assert.equal(model.progress, null)
    assert.equal(model.currentLabel, "—")
    assert.equal(model.tone, "info")
  })
})
