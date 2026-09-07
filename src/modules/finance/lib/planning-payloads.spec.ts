import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildCreateReceivableBody,
  buildCreateSavingsGoalBody,
  buildLoanBody,
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

describe("buildCreateReceivableBody", () => {
  it("rejects paidAmount greater than amount (400-equivalent)", () => {
    const result = buildCreateReceivableBody({
      debtorName: "Ana",
      amount: "100",
      paidAmount: "150",
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.match(result.error, /paidAmount cannot exceed amount/)
  })

  it("omits paidAmount when status is PAID and the field is empty", () => {
    const result = buildCreateReceivableBody({
      debtorName: "Ana",
      amount: "100",
      status: "PAID",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.status, "PAID")
    assert.equal("paidAmount" in result.body, false)
  })

  it("allows CANCELLED with a partial paidAmount", () => {
    const result = buildCreateReceivableBody({
      debtorName: "Ana",
      amount: "100",
      paidAmount: "40",
      status: "CANCELLED",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.status, "CANCELLED")
    assert.equal(result.body.paidAmount, 40)
  })
})

describe("buildCreateSavingsGoalBody", () => {
  it("sends targetAmount as a number and does not invent isCompleted", () => {
    const result = buildCreateSavingsGoalBody({
      name: "Fondo",
      targetAmount: "5000",
      currentAmount: "5000",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.targetAmount, 5000)
    assert.equal(result.body.currentAmount, 5000)
    assert.equal("isCompleted" in result.body, false)
  })
})
