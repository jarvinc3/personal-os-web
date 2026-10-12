import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { loanSchema, loanWizardPrefill } from "./loan-form.ts"

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

describe("loanWizardPrefill", () => {
  it("reads amount and periods", () => {
    assert.deepEqual(
      loanWizardPrefill(new URLSearchParams("amount=20000&periods=24")),
      { amount: "20000", periods: "24" }
    )
  })

  it("switches to the installment mode when a cuota is present", () => {
    assert.deepEqual(
      loanWizardPrefill(new URLSearchParams("amount=1000&installment=120")),
      { amount: "1000", installment: "120", known: "INSTALLMENT" }
    )
  })

  it("treats a lender name as a person loan", () => {
    assert.deepEqual(
      loanWizardPrefill(new URLSearchParams("lenderName=Juan")),
      { lenderName: "Juan", who: "PERSON" }
    )
  })

  it("lets an explicit who win over the lender name", () => {
    assert.deepEqual(
      loanWizardPrefill(new URLSearchParams("lenderName=Juan&who=BANK")),
      { lenderName: "Juan", who: "BANK" }
    )
  })

  it("accepts a known frequency", () => {
    assert.deepEqual(loanWizardPrefill(new URLSearchParams("freq=WEEKLY")), {
      freq: "WEEKLY",
    })
  })

  it("ignores empty and unknown values", () => {
    assert.deepEqual(
      loanWizardPrefill(
        new URLSearchParams("amount=&freq=YEARLY&who=OTHER&periods=")
      ),
      {}
    )
  })
})
