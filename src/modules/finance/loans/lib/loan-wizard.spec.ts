import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  annualRateFromInstallment,
  buildLoanSchedule,
  computeLoanPlan,
  dueDateAfter,
  installmentAmount,
  outstandingBalance,
  periodsElapsed,
  roundToCents,
} from "./loan-wizard.ts"

describe("installmentAmount", () => {
  it("splits the principal evenly when the rate is zero", () => {
    const value = installmentAmount({
      principal: 1200,
      annualRate: 0,
      periods: 12,
      freq: "MONTHLY",
    })
    assert.equal(roundToCents(value), 100)
  })

  it("applies the french amortization formula", () => {
    const value = installmentAmount({
      principal: 1000,
      annualRate: 0.12,
      periods: 12,
      freq: "MONTHLY",
    })
    assert.equal(roundToCents(value), 88.85)
  })

  it("charges more per period on a shorter term", () => {
    const short = installmentAmount({
      principal: 1000,
      annualRate: 0.12,
      periods: 6,
      freq: "MONTHLY",
    })
    const long = installmentAmount({
      principal: 1000,
      annualRate: 0.12,
      periods: 24,
      freq: "MONTHLY",
    })
    assert.ok(short > long)
  })
})

describe("outstandingBalance", () => {
  it("equals the principal before any payment", () => {
    const value = outstandingBalance({
      principal: 1000,
      annualRate: 0.12,
      periods: 12,
      paidPeriods: 0,
      freq: "MONTHLY",
    })
    assert.equal(roundToCents(value), 1000)
  })

  it("reaches zero after the last period", () => {
    const value = outstandingBalance({
      principal: 1000,
      annualRate: 0.12,
      periods: 12,
      paidPeriods: 12,
      freq: "MONTHLY",
    })
    assert.equal(roundToCents(value), 0)
  })

  it("goes down as periods are paid", () => {
    const paid = outstandingBalance({
      principal: 1000,
      annualRate: 0.12,
      periods: 12,
      paidPeriods: 5,
      freq: "MONTHLY",
    })
    assert.ok(paid > 0 && paid < 1000)
  })
})

describe("annualRateFromInstallment", () => {
  it("recovers the rate used to build the instalment", () => {
    const installment = installmentAmount({
      principal: 1000,
      annualRate: 0.12,
      periods: 12,
      freq: "MONTHLY",
    })
    const rate = annualRateFromInstallment({
      principal: 1000,
      installment,
      periods: 12,
      freq: "MONTHLY",
    })
    assert.ok(rate !== null)
    assert.ok(Math.abs(rate - 0.12) < 0.0001)
  })

  it("returns zero when the instalment does not cover interest", () => {
    const rate = annualRateFromInstallment({
      principal: 1200,
      installment: 100,
      periods: 12,
      freq: "MONTHLY",
    })
    assert.equal(rate, 0)
  })

  it("returns null when the instalment is impossibly high", () => {
    const rate = annualRateFromInstallment({
      principal: 1000,
      installment: 100000,
      periods: 12,
      freq: "MONTHLY",
    })
    assert.equal(rate, null)
  })
})

describe("periodsElapsed", () => {
  it("counts calendar months for a monthly loan", () => {
    assert.equal(
      periodsElapsed({
        freq: "MONTHLY",
        from: new Date(Date.UTC(2026, 0, 1)),
        to: new Date(Date.UTC(2026, 3, 1)),
      }),
      3
    )
  })

  it("does not count a month until its day arrives", () => {
    assert.equal(
      periodsElapsed({
        freq: "MONTHLY",
        from: new Date(2025, 11, 10),
        to: new Date(2026, 5, 1),
      }),
      5
    )
  })

  it("counts the month when its day falls on a shorter month", () => {
    assert.equal(
      periodsElapsed({
        freq: "MONTHLY",
        from: new Date(2026, 0, 31),
        to: new Date(2026, 1, 28),
      }),
      1
    )
  })

  it("counts weeks for a weekly loan", () => {
    assert.equal(
      periodsElapsed({
        freq: "WEEKLY",
        from: new Date(Date.UTC(2026, 0, 1)),
        to: new Date(Date.UTC(2026, 0, 15)),
      }),
      2
    )
  })

  it("never returns a negative count", () => {
    assert.equal(
      periodsElapsed({
        freq: "MONTHLY",
        from: new Date(Date.UTC(2026, 5, 1)),
        to: new Date(Date.UTC(2026, 0, 1)),
      }),
      0
    )
  })
})

describe("dueDateAfter", () => {
  it("clamps to the last day of a shorter month", () => {
    const value = dueDateAfter({
      freq: "MONTHLY",
      from: new Date(2026, 0, 31),
      periods: 1,
    })
    assert.equal(value.getMonth(), 1)
    assert.equal(value.getDate(), 28)
  })
})

describe("buildLoanSchedule", () => {
  const schedule = buildLoanSchedule({
    principal: 12000,
    annualRate: 0.24,
    periods: 12,
    freq: "MONTHLY",
  })

  it("adds up to the principal", () => {
    const principalTotal = schedule.reduce((sum, row) => sum + row.principal, 0)
    assert.equal(roundToCents(principalTotal), 12000)
  })

  it("gives every row the instalment except the last, which absorbs rounding", () => {
    const last = schedule[schedule.length - 1]
    assert.equal(schedule[0].amount, 1134.72)
    assert.equal(last.amount, 1134.67)
  })

  it("keeps the interest of each row equal to its amount minus its principal", () => {
    for (const row of schedule) {
      assert.equal(roundToCents(row.amount - row.principal), row.interest)
    }
  })
})

describe("computeLoanPlan", () => {
  const now = new Date(Date.UTC(2026, 5, 1))

  it("derives instalment, paid periods and balance from a known rate", () => {
    const plan = computeLoanPlan({
      principal: 350000,
      periods: 36,
      freq: "MONTHLY",
      disbursementDate: new Date(Date.UTC(2025, 11, 10)),
      now,
      known: "RATE",
      annualRatePercent: 14.5,
    })
    assert.ok(plan !== null)
    assert.ok(plan.installmentAmount > 0)
    assert.equal(plan.paidPeriods, 5)
    assert.ok(plan.outstandingBalance < 350000)
    assert.ok(plan.totalInterest > 0)
  })

  it("totals the interest of the shown instalments instead of the raw quote", () => {
    const plan = computeLoanPlan({
      principal: 12000,
      periods: 12,
      freq: "MONTHLY",
      disbursementDate: new Date(Date.UTC(2026, 5, 1)),
      now,
      known: "RATE",
      annualRatePercent: 24,
    })
    assert.ok(plan !== null)
    assert.equal(plan.totalInterest, 1616.59)
    assert.equal(plan.lastInstallmentAmount, 1134.67)
    const paid = plan.installmentAmount * 11 + plan.lastInstallmentAmount
    assert.equal(roundToCents(paid), roundToCents(12000 + plan.totalInterest))
  })

  it("solves the rate when the user knows the instalment", () => {
    const plan = computeLoanPlan({
      principal: 1000,
      periods: 12,
      freq: "MONTHLY",
      disbursementDate: new Date(Date.UTC(2026, 0, 1)),
      now,
      known: "INSTALLMENT",
      installmentAmount: 88.85,
    })
    assert.ok(plan !== null)
    assert.ok(Math.abs(plan.annualRate - 0.12) < 0.005)
  })

  it("returns null for an empty principal", () => {
    assert.equal(
      computeLoanPlan({
        principal: 0,
        periods: 12,
        freq: "MONTHLY",
        disbursementDate: new Date(Date.UTC(2026, 0, 1)),
        now,
        known: "RATE",
        annualRatePercent: 10,
      }),
      null
    )
  })
})
