import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type { LoanWizardValues } from "./loan-form.ts"
import { loanWizardPlan } from "./loan-wizard-plan.ts"

const NOW = new Date("2026-10-20T15:00:00.000Z")

const values: LoanWizardValues = {
  who: "BANK",
  lenderName: "",
  institutionId: "inst-1",
  amount: "120000",
  currency: "DOP",
  freq: "MONTHLY",
  periods: "12",
  known: "RATE",
  ratePercent: "24",
  installment: "",
  accountId: CATALOG_NONE,
  disbursementDate: "2026-10-01",
  rateType: "FIXED",
  insuranceAmount: "",
  notes: "",
}

describe("loanWizardPlan", () => {
  it("builds the plan from the annual rate", () => {
    const plan = loanWizardPlan({ values, now: NOW })
    assert.ok(plan)
    assert.ok(plan.installmentAmount > 0)
    assert.equal(plan.annualRate, 0.24)
  })

  it("treats an empty rate as zero interest", () => {
    const plan = loanWizardPlan({
      values: { ...values, ratePercent: "" },
      now: NOW,
    })
    assert.ok(plan)
    assert.equal(plan.annualRate, 0)
    assert.equal(plan.totalInterest, 0)
  })

  it("solves the rate when the installment is the known value", () => {
    const plan = loanWizardPlan({
      values: { ...values, known: "INSTALLMENT", installment: "11300" },
      now: NOW,
    })
    assert.ok(plan)
    assert.ok(plan.annualRate > 0)
  })

  it("returns null without an amount, a term or a usable rate", () => {
    assert.equal(
      loanWizardPlan({ values: { ...values, amount: "" }, now: NOW }),
      null
    )
    assert.equal(
      loanWizardPlan({ values: { ...values, periods: "0" }, now: NOW }),
      null
    )
    assert.equal(
      loanWizardPlan({ values: { ...values, ratePercent: "-4" }, now: NOW }),
      null
    )
    assert.equal(
      loanWizardPlan({
        values: { ...values, known: "INSTALLMENT", installment: "" },
        now: NOW,
      }),
      null
    )
  })

  it("returns null without form values", () => {
    assert.equal(loanWizardPlan({ values: undefined, now: NOW }), null)
  })
})
