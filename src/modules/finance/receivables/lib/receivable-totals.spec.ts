import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"
import { receivableTotalsByCurrency } from "./receivable-totals.ts"

function receivable(overrides: Partial<FinanceReceivable>): FinanceReceivable {
  return {
    id: "r-1",
    debtorName: "Ana",
    description: null,
    amount: "3000.00",
    paidAmount: "0.00",
    creditBalance: "0.00",
    writtenOffAmount: "0.00",
    writtenOffAt: null,
    currency: "DOP",
    dueDate: null,
    status: "PENDING",
    ...overrides,
  }
}

describe("receivableTotalsByCurrency", () => {
  it("keeps each currency apart", () => {
    const totals = receivableTotalsByCurrency([
      receivable({ id: "r-1", amount: "3000.00" }),
      receivable({ id: "r-2", amount: "50.00", currency: "USD" }),
    ])

    assert.deepEqual(totals, [
      { currency: "DOP", pending: 3000, collected: 0 },
      { currency: "USD", pending: 50, collected: 0 },
    ])
  })

  it("moves a full payment from pending to collected", () => {
    const totals = receivableTotalsByCurrency([
      receivable({ amount: "3000.00", paidAmount: "3000.00", status: "PAID" }),
    ])

    assert.deepEqual(totals, [{ currency: "DOP", pending: 0, collected: 3000 }])
  })

  it("splits a partial payment between both totals", () => {
    const totals = receivableTotalsByCurrency([
      receivable({
        amount: "3000.00",
        paidAmount: "1200.00",
        status: "PARTIAL",
      }),
    ])

    assert.deepEqual(totals, [
      { currency: "DOP", pending: 1800, collected: 1200 },
    ])
  })

  it("leaves out currencies without receivables", () => {
    const totals = receivableTotalsByCurrency([receivable({ currency: "DOP" })])

    assert.deepEqual(
      totals.map((entry) => entry.currency),
      ["DOP"]
    )
  })

  it("does not let a written off balance count as pending", () => {
    const totals = receivableTotalsByCurrency([
      receivable({ amount: "1000.00", writtenOffAmount: "1000.00" }),
    ])

    assert.deepEqual(totals, [{ currency: "DOP", pending: 0, collected: 0 }])
  })
})

describe("receivableTotalsByCurrency con datos rotos", () => {
  it("no inventa un cero cuando el monto no se puede leer", () => {
    assert.throws(
      () =>
        receivableTotalsByCurrency([receivable({ id: "r-roto", amount: "" })]),
      /r-roto con amount ilegible/
    )
  })

  it("avisa cual cobro trae un pago ilegible", () => {
    assert.throws(
      () =>
        receivableTotalsByCurrency([
          receivable({ id: "r-pago", paidAmount: "n/a" }),
        ]),
      /r-pago con paidAmount ilegible/
    )
  })
})
