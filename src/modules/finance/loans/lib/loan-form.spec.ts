import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { loanSchema } from "./loan-form.ts"

const validLoan = {
  lenderName: "Banco",
  institutionId: "",
  accountId: "",
  originalAmount: "1000",
  currentBalance: "800",
  installmentAmount: "100",
  installmentFreq: "MONTHLY" as const,
  totalInstallments: "10",
  paidInstallments: "2",
  nextDueDate: "2026-02-01",
  interestRatePercent: "",
  notes: "",
  currency: "EUR",
}

describe("loanSchema", () => {
  it("accepts a monthly loan", () => {
    assert.equal(loanSchema.safeParse(validLoan).success, true)
  })

  it("rejects an empty lender name", () => {
    assert.equal(
      loanSchema.safeParse({ ...validLoan, lenderName: "" }).success,
      false
    )
  })

  it("rejects a balance above the original amount", () => {
    assert.equal(
      loanSchema.safeParse({ ...validLoan, currentBalance: "5000" }).success,
      false
    )
  })

  it("rejects a non-positive instalment", () => {
    assert.equal(
      loanSchema.safeParse({ ...validLoan, installmentAmount: "0" }).success,
      false
    )
  })

  it("rejects paid instalments above the total", () => {
    assert.equal(
      loanSchema.safeParse({
        ...validLoan,
        totalInstallments: "2",
        paidInstallments: "5",
      }).success,
      false
    )
  })

  it("does not add a cross-field error when the total is empty", () => {
    const parseResult = loanSchema.safeParse({
      ...validLoan,
      totalInstallments: "",
      paidInstallments: "2",
    })
    assert.equal(parseResult.success, false)
    if (parseResult.success) {
      return
    }
    const paths = parseResult.error.issues.map((issue) => issue.path.join("."))
    assert.equal(paths.includes("paidInstallments"), false)
  })
})
