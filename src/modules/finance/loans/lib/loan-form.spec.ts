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
})
