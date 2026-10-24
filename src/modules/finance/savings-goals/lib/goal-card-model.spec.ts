import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities.ts"
import { goalCardModel } from "./goal-card-model.ts"

const DISPLAY = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es",
}

const GOAL: FinanceSavingsGoal = {
  id: "goal-1",
  name: "Viaje",
  description: null,
  targetAmount: "100000",
  currentAmount: "25000",
  currency: "DOP",
  targetDate: "2026-12-31",
  accountId: null,
  mode: "EARMARK",
  spendReducesProgress: false,
  isCompleted: false,
  completedAt: null,
}

describe("goalCardModel", () => {
  it("adds the remaining amount and the target date to the caption", () => {
    const model = goalCardModel(GOAL, DISPLAY)

    assert.equal(model.title, "Viaje")
    assert.equal(model.progress, 25)
    assert.equal(model.badge.label, "En curso")
    assert.match(String(model.caption), /^Faltan /)
    assert.match(String(model.caption), /Para /)
  })

  it("marks a completed goal as reached", () => {
    const model = goalCardModel(
      { ...GOAL, isCompleted: true, currentAmount: "100000" },
      DISPLAY
    )

    assert.equal(model.tone, "success")
    assert.equal(model.badge.label, "Completada")
    assert.match(String(model.caption), /Meta alcanzada/)
    assert.equal(model.progress, 100)
  })

  it("leaves progress empty when an amount is unreadable", () => {
    const model = goalCardModel({ ...GOAL, currentAmount: "nope" }, DISPLAY)

    assert.equal(model.progress, null)
    assert.equal(model.currentLabel, "—")
  })
})
