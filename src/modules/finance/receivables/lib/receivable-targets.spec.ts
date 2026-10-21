import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"
import { receivableTargets } from "./receivable-targets.ts"

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

describe("receivableTargets", () => {
  it("offers the open receivables in the same currency", () => {
    const targets = receivableTargets({
      receivables: [
        receivable({ id: "r-1" }),
        receivable({ id: "r-2", debtorName: "Luis", currency: "USD" }),
        receivable({ id: "r-3", debtorName: "Eva" }),
      ],
      excludeId: null,
      currency: "DOP",
    })

    assert.deepEqual(
      targets.map((target) => target.id),
      ["r-1", "r-3"]
    )
    assert.equal(targets[0].pending, 3000)
  })

  it("leaves out the receivable being paid and the closed ones", () => {
    const targets = receivableTargets({
      receivables: [
        receivable({ id: "r-1" }),
        receivable({ id: "r-2", status: "PAID" }),
        receivable({ id: "r-3", status: "CANCELLED" }),
        receivable({ id: "r-4", status: "WRITTEN_OFF" }),
      ],
      excludeId: "r-1",
      currency: "DOP",
    })

    assert.deepEqual(targets, [])
  })

  it("skips receivables with nothing left to collect", () => {
    const targets = receivableTargets({
      receivables: [
        receivable({ id: "r-1", paidAmount: "3000.00" }),
        receivable({ id: "r-2", paidAmount: "1000.00" }),
      ],
      excludeId: null,
      currency: "DOP",
    })

    assert.deepEqual(
      targets.map((target) => target.id),
      ["r-2"]
    )
    assert.equal(targets[0].pending, 2000)
  })

  it("does not filter by currency when none is given", () => {
    const targets = receivableTargets({
      receivables: [
        receivable({ id: "r-1", currency: "DOP" }),
        receivable({ id: "r-2", currency: "USD" }),
      ],
      excludeId: null,
    })

    assert.equal(targets.length, 2)
  })
})
