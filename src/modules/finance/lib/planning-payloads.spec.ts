import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildLoanBody,
  buildReceivableBody,
  buildReceivablePaymentBody,
  buildSavingsGoalBody,
  buildSavingsGoalContributionBody,
} from "./planning-payloads.ts"

describe("buildLoanBody", () => {
  const base = {
    lenderName: "Banco",
    originalAmount: "10000",
    currentBalance: "8000",
    installmentAmount: "500",
    installmentFreq: "MONTHLY",
    totalInstallments: "24",
    nextDueDate: "2026-10-01",
  }

  it("sends interestRate as number 0.12 when the UI is 12%", () => {
    const result = buildLoanBody({ ...base, interestRatePercent: "12" })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.interestRate, 0.12)
    assert.equal(typeof result.body.interestRate, "number")
    assert.notEqual(result.body.interestRate, 12)
    assert.equal(JSON.stringify(result.body).includes('"interestRate":0.12'), true)
  })

  it("omits interestRate when the percent field is empty", () => {
    const result = buildLoanBody(base)
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal("interestRate" in result.body, false)
  })

  it("sends null interestRate on update when the field is cleared", () => {
    const result = buildLoanBody(base, { isUpdate: true })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.interestRate, null)
  })

  it("rejects NaN money", () => {
    const result = buildLoanBody({ ...base, originalAmount: "abc" })
    assert.equal(result.ok, false)
  })

  it("sends catalog institution and payment account ids", () => {
    const result = buildLoanBody({
      ...base,
      institutionId: "inst-1",
      accountId: "acc-1",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.institutionId, "inst-1")
    assert.equal(result.body.accountId, "acc-1")
  })
})

describe("buildReceivableBody", () => {
  it("rejects paidAmount greater than amount (400-equivalent)", () => {
    const payload = buildReceivableBody({
      debtorName: "Ana",
      amount: "100",
      paidAmount: "150",
    })
    assert.equal(payload.ok, false)
    if (payload.ok) {
      return
    }
    assert.match(payload.error, /paidAmount cannot exceed amount/)
  })

  it("omits paidAmount when status is PAID and the field is empty", () => {
    const payload = buildReceivableBody({
      debtorName: "Ana",
      amount: "100",
      status: "PAID",
    })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal(payload.body.status, "PAID")
    assert.equal("paidAmount" in payload.body, false)
  })

  it("allows CANCELLED with a partial paidAmount", () => {
    const payload = buildReceivableBody({
      debtorName: "Ana",
      amount: "100",
      paidAmount: "40",
      status: "CANCELLED",
    })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal(payload.body.status, "CANCELLED")
    assert.equal(payload.body.paidAmount, 40)
  })

  it("drops the collected amount when updating a receivable", () => {
    const payload = buildReceivableBody(
      { debtorName: "Ana", amount: "100", paidAmount: "40" },
      { isUpdate: true }
    )
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal("paidAmount" in payload.body, false)
  })
})

describe("buildSavingsGoalContributionBody", () => {
  it("sends the amount as a number and leaves the date out when empty", () => {
    const payload = buildSavingsGoalContributionBody({ amount: "5000" })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal(payload.body.amount, 5000)
    assert.equal("contributedAt" in payload.body, false)
  })

  it("rejects a contribution of zero", () => {
    assert.equal(
      buildSavingsGoalContributionBody({ amount: "0" }).ok,
      false
    )
  })
})

describe("buildReceivablePaymentBody", () => {
  it("needs the account the money entered", () => {
    assert.equal(
      buildReceivablePaymentBody({ amount: "100", accountId: "  " }).ok,
      false
    )
  })

  it("keeps the account and the amount as a number", () => {
    const payload = buildReceivablePaymentBody({
      amount: "100",
      accountId: "acc-1",
    })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal(payload.body.accountId, "acc-1")
    assert.equal(payload.body.amount, 100)
  })
})

describe("buildSavingsGoalBody", () => {
  it("sends targetAmount as a number and does not invent isCompleted", () => {
    const payload = buildSavingsGoalBody({
      name: "Fondo",
      targetAmount: "5000",
      currentAmount: "5000",
    })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal(payload.body.targetAmount, 5000)
    assert.equal(payload.body.currentAmount, 5000)
    assert.equal("isCompleted" in payload.body, false)
  })

  it("drops the opening amount when updating a goal", () => {
    const payload = buildSavingsGoalBody(
      { name: "Fondo", targetAmount: "5000", currentAmount: "500" },
      { isUpdate: true }
    )
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal("currentAmount" in payload.body, false)
  })
})
