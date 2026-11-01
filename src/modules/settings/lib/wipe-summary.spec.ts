import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { wipeSummary } from "./wipe-summary.ts"

const BRANCH_LABELS = {
  "finance.transactions": "Movimientos y transferencias",
  "finance.reconciliations": "Conciliaciones y descuadres",
  "finance.budgets": "Presupuestos",
  "finance.categories": "Categorías propias",
  "finance.merchants": "Comercios",
}

describe("wipeSummary", () => {
  it("nombra las ramas aplicadas y suma las filas", () => {
    const summary = wipeSummary({
      wipeResult: {
        appliedBranches: ["finance.transactions", "finance.reconciliations"],
        counts: { "finance.transactions": 5, "finance.reconciliations": 3 },
      },
      branchLabels: BRANCH_LABELS,
    })

    assert.equal(
      summary,
      "Movimientos y transferencias, Conciliaciones y descuadres · 8 filas afectadas."
    )
  })

  it("resume el resto cuando hay más de cuatro ramas", () => {
    const summary = wipeSummary({
      wipeResult: {
        appliedBranches: [
          "finance.transactions",
          "finance.reconciliations",
          "finance.budgets",
          "finance.categories",
          "finance.merchants",
        ],
        counts: { "finance.transactions": 10 },
      },
      branchLabels: BRANCH_LABELS,
    })

    assert.equal(
      summary,
      "Movimientos y transferencias, Conciliaciones y descuadres, Presupuestos y 2 más · 10 filas afectadas."
    )
  })

  it("usa el identificador cuando falta la etiqueta", () => {
    const summary = wipeSummary({
      wipeResult: {
        appliedBranches: ["ai.inferences"],
        counts: { "ai.inferences": 2 },
      },
    })

    assert.equal(summary, "ai.inferences · 2 filas afectadas.")
  })

  it("concuerda en singular con una sola fila", () => {
    const summary = wipeSummary({
      wipeResult: {
        appliedBranches: ["finance.merchants"],
        counts: { "finance.merchants": 1 },
      },
      branchLabels: BRANCH_LABELS,
    })

    assert.equal(summary, "Comercios · 1 fila afectada.")
  })

  it("no resume nada cuando no se aplicó ninguna rama", () => {
    const summary = wipeSummary({
      wipeResult: { appliedBranches: [], counts: {} },
    })

    assert.equal(summary, undefined)
  })
})
