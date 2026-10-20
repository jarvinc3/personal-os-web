import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceLoanInstallment } from "@/src/modules/finance/shared/types/entities"
import { buildAmortizationPlan } from "./amortization-plan.ts"

function installment(
  overrides: Partial<FinanceLoanInstallment> & { installmentNo: number }
): FinanceLoanInstallment {
  return {
    id: `installment-${overrides.installmentNo}`,
    loanId: "loan-1",
    dueDate: "2026-01-01",
    amount: "100.00",
    principal: "0.00",
    interest: "0.00",
    insurance: "0.00",
    fees: "0.00",
    lateFee: "0.00",
    paidAmount: "0.00",
    status: "PENDING",
    paidAt: null,
    ...overrides,
  }
}

describe("buildAmortizationPlan", () => {
  it("reconstructs the initial balance from the paid principal plus the current balance", () => {
    const plan = buildAmortizationPlan(
      [
        installment({ installmentNo: 2, principal: "100.00" }),
        installment({
          installmentNo: 1,
          principal: "100.00",
          status: "PAID",
        }),
        installment({ installmentNo: 3, principal: "100.00" }),
      ],
      200
    )

    assert.deepEqual(
      plan.map((row) => row.installmentNo),
      [1, 2, 3]
    )
    assert.deepEqual(
      plan.map((row) => row.remainingBalance),
      [200, 100, 0]
    )
  })

  it("keeps cents exact when the principal has cents", () => {
    const plan = buildAmortizationPlan(
      [
        installment({ installmentNo: 1, principal: "0.10" }),
        installment({ installmentNo: 2, principal: "0.20" }),
      ],
      0.3
    )

    assert.equal(plan[0]?.remainingBalance, 0.2)
    assert.equal(plan[1]?.remainingBalance, 0)
  })

  it("returns an empty plan without installments", () => {
    assert.deepEqual(buildAmortizationPlan([], 500), [])
  })

  it("leaves the remaining balance unknown when a principal is not readable", () => {
    const plan = buildAmortizationPlan(
      [
        installment({ installmentNo: 1, principal: "" }),
        installment({ installmentNo: 2, principal: "50.00" }),
      ],
      100
    )

    assert.deepEqual(
      plan.map((row) => row.remainingBalance),
      [null, null]
    )
  })
})
