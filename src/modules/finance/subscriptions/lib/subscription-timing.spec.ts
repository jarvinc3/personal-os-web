import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceSubscription } from "@/src/modules/finance/shared/types/entities"
import {
  billingLabel,
  billingMonthLabel,
  cycleProgress,
  subscriptionCycleProgress,
  subscriptionIsOverdue,
} from "./subscription-timing.ts"

const day = (year: number, month: number, dayOfMonth: number) =>
  new Date(year, month - 1, dayOfMonth)

function subscription(
  overrides: Partial<FinanceSubscription> = {}
): FinanceSubscription {
  return {
    id: "sub-1",
    name: "Netflix",
    normalizedKey: "NETFLIX",
    domain: null,
    logoUrl: null,
    amount: "100.00",
    currency: "DOP",
    billingCycle: "MONTHLY",
    billingInterval: 1,
    anchorDate: "2026-10-10",
    nextBillingDate: "2026-11-10",
    trialEndsAt: null,
    status: "ACTIVE",
    pausedAt: null,
    cancelledAt: null,
    reminderDaysBefore: 5,
    lastRemindedFor: null,
    lastChargeMismatch: false,
    lastPaymentAmount: null,
    cardId: null,
    cardName: null,
    accountId: null,
    accountName: null,
    categoryId: null,
    category: null,
    paymentMethod: null,
    manageUrl: null,
    notes: null,
    sourcePatternId: null,
    monthlyEquivalent: "100.00",
    annualEquivalent: "1200.00",
    daysUntil: 20,
    createdAt: "2026-10-10T00:00:00.000Z",
    updatedAt: "2026-10-10T00:00:00.000Z",
    ...overrides,
  }
}

describe("billingLabel", () => {
  it("counts today and tomorrow", () => {
    assert.deepEqual(
      billingLabel({
        nextDate: "2026-10-14",
        today: day(2026, 10, 14),
        windowDays: 5,
      }),
      { text: "Hoy", inWindow: true }
    )
    assert.deepEqual(
      billingLabel({
        nextDate: "2026-10-15",
        today: day(2026, 10, 14),
        windowDays: 5,
      }),
      { text: "Mañana", inWindow: true }
    )
  })

  it("counts the days left inside the window", () => {
    assert.deepEqual(
      billingLabel({
        nextDate: "2026-10-18",
        today: day(2026, 10, 14),
        windowDays: 5,
      }),
      { text: "en 4 días", inWindow: true }
    )
  })

  it("treats the last day of the window as inside it", () => {
    assert.deepEqual(
      billingLabel({
        nextDate: "2026-10-19",
        today: day(2026, 10, 14),
        windowDays: 5,
      }),
      { text: "en 5 días", inWindow: true }
    )
  })

  it("shows the short date right outside the window", () => {
    assert.deepEqual(
      billingLabel({
        nextDate: "2026-10-20",
        today: day(2026, 10, 14),
        windowDays: 5,
      }),
      { text: "20 oct", inWindow: false }
    )
  })

  it("shows the short date for a charge already past", () => {
    assert.deepEqual(
      billingLabel({
        nextDate: "2026-10-10",
        today: day(2026, 10, 14),
        windowDays: 5,
      }),
      { text: "10 oct", inWindow: false }
    )
  })

  it("crosses months and years", () => {
    assert.deepEqual(
      billingLabel({
        nextDate: "2027-01-02",
        today: day(2026, 12, 31),
        windowDays: 5,
      }),
      { text: "en 2 días", inWindow: true }
    )
    assert.deepEqual(
      billingLabel({
        nextDate: "2027-01-20",
        today: day(2026, 12, 31),
        windowDays: 5,
      }),
      { text: "20 ene", inWindow: false }
    )
  })

  it("follows a custom window", () => {
    assert.equal(
      billingLabel({
        nextDate: "2026-10-24",
        today: day(2026, 10, 14),
        windowDays: 10,
      }).inWindow,
      true
    )
    assert.equal(
      billingLabel({
        nextDate: "2026-10-24",
        today: day(2026, 10, 14),
        windowDays: 3,
      }).text,
      "24 oct"
    )
  })
})

describe("billingMonthLabel", () => {
  it("writes the month and year of a start date", () => {
    assert.equal(billingMonthLabel("2023-03-12T00:00:00.000Z"), "mar 2023")
    assert.equal(billingMonthLabel(new Date(2026, 9, 14)), "oct 2026")
  })
})

describe("cycleProgress", () => {
  const cycle = {
    start: day(2026, 10, 10),
    next: day(2026, 11, 10),
  }

  it("starts at zero on the first day of the cycle", () => {
    const progress = cycleProgress({ ...cycle, today: day(2026, 10, 10) })
    assert.equal(progress.ratio, 0)
    assert.equal(progress.percent, 0)
    assert.equal(progress.elapsedDays, 0)
    assert.equal(progress.cycleDays, 31)
  })

  it("is halfway through the cycle in the middle", () => {
    const progress = cycleProgress({ ...cycle, today: day(2026, 10, 25) })
    assert.ok(Math.abs(progress.ratio - 15 / 31) < 0.0001)
  })

  it("reaches one on the next charge", () => {
    const progress = cycleProgress({ ...cycle, today: day(2026, 11, 10) })
    assert.equal(progress.ratio, 1)
    assert.equal(progress.percent, 100)
  })

  it("clamps a date before the cycle and one past its end", () => {
    assert.equal(cycleProgress({ ...cycle, today: day(2026, 9, 1) }).ratio, 0)
    assert.equal(cycleProgress({ ...cycle, today: day(2026, 12, 1) }).ratio, 1)
  })

  it("keeps a zero-day cycle from dividing by zero", () => {
    const progress = cycleProgress({
      start: day(2026, 10, 10),
      next: day(2026, 10, 10),
      today: day(2026, 10, 10),
    })
    assert.equal(progress.cycleDays, 1)
    assert.equal(progress.ratio, 0)
  })
})

describe("subscriptionCycleProgress", () => {
  it("measures a monthly cycle from the previous charge", () => {
    const progress = subscriptionCycleProgress(
      subscription(),
      day(2026, 10, 20)
    )
    assert.equal(progress.startDate.toISOString().slice(0, 10), "2026-10-10")
    assert.equal(progress.endDate.toISOString().slice(0, 10), "2026-11-10")
    assert.equal(progress.cycleDays, 31)
    assert.ok(Math.abs(progress.percent - 32.26) < 0.05)
  })

  it("measures weekly cycles", () => {
    const progress = subscriptionCycleProgress(
      subscription({
        billingCycle: "WEEKLY",
        nextBillingDate: "2026-11-10",
      }),
      day(2026, 11, 7)
    )
    assert.equal(progress.startDate.toISOString().slice(0, 10), "2026-11-03")
    assert.equal(progress.cycleDays, 7)
  })

  it("measures yearly cycles", () => {
    const progress = subscriptionCycleProgress(
      subscription({
        billingCycle: "YEARLY",
        nextBillingDate: "2026-11-10",
      }),
      day(2026, 5, 10)
    )
    assert.equal(progress.startDate.toISOString().slice(0, 10), "2025-11-10")
    assert.equal(progress.cycleDays, 365)
    assert.ok(progress.ratio > 0.4 && progress.ratio < 0.6)
  })

  it("measures quarterly and semiannual cycles", () => {
    const quarterly = subscriptionCycleProgress(
      subscription({
        billingCycle: "QUARTERLY",
        nextBillingDate: "2026-11-10",
      }),
      day(2026, 10, 10)
    )
    assert.equal(quarterly.startDate.toISOString().slice(0, 10), "2026-08-10")
    assert.equal(quarterly.cycleDays, 92)

    const semiannual = subscriptionCycleProgress(
      subscription({
        billingCycle: "SEMIANNUAL",
        nextBillingDate: "2026-11-10",
      }),
      day(2026, 10, 10)
    )
    assert.equal(semiannual.startDate.toISOString().slice(0, 10), "2026-05-10")
    assert.equal(semiannual.cycleDays, 184)
  })

  it("clamps a charge already past its date to 100 %", () => {
    const progress = subscriptionCycleProgress(
      subscription(),
      day(2026, 11, 20)
    )
    assert.equal(progress.percent, 100)
  })
})

describe("subscriptionIsOverdue", () => {
  it("is true only for an active subscription past its charge date", () => {
    assert.equal(
      subscriptionIsOverdue(
        subscription({ nextBillingDate: "2026-10-20" }),
        day(2026, 10, 22)
      ),
      true
    )
    assert.equal(
      subscriptionIsOverdue(
        subscription({ nextBillingDate: "2026-10-22" }),
        day(2026, 10, 22)
      ),
      false
    )
    assert.equal(
      subscriptionIsOverdue(
        subscription({ status: "PAUSED", nextBillingDate: "2026-10-20" }),
        day(2026, 10, 22)
      ),
      false
    )
  })
})
