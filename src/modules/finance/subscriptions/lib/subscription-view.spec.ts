import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceRecurringPattern,
  FinanceSubscription,
} from "@/src/modules/finance/shared/types/entities"
import {
  alertOccurrenceLabel,
  breakdownFilter,
  buildSubscriptionSlices,
  groupSubscriptions,
  subscriptionCycleProgress,
  subscriptionPayloadFromPattern,
} from "./subscription-view.ts"

const localDay = (year: number, month: number, dayOfMonth: number) =>
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
    reminderDaysBefore: 3,
    lastRemindedFor: null,
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

describe("subscriptionCycleProgress", () => {
  it("measures the cycle from the previous charge to the next one", () => {
    const progress = subscriptionCycleProgress(
      subscription(),
      localDay(2026, 10, 20)
    )
    assert.equal(progress.startDate.toISOString().slice(0, 10), "2026-10-10")
    assert.equal(progress.endDate.toISOString().slice(0, 10), "2026-11-10")
    assert.equal(progress.cycleDays, 31)
    assert.equal(progress.elapsedDays, 10)
    assert.ok(Math.abs(progress.percent - 32.26) < 0.05)
  })

  it("clamps a charge already past its date to 100 %", () => {
    const progress = subscriptionCycleProgress(
      subscription(),
      localDay(2026, 11, 20)
    )
    assert.equal(progress.percent, 100)
  })
})

describe("groupSubscriptions", () => {
  it("groups by category with a fallback for uncategorized", () => {
    const groups = groupSubscriptions(
      [
        subscription({
          id: "sub-1",
          category: { id: "cat-1", name: "Ocio", icon: null, color: null },
        }),
        subscription({ id: "sub-2" }),
      ],
      "category"
    )
    assert.deepEqual(
      groups.map((group) => [group.key, group.items.length]),
      [
        ["cat-1", 1],
        ["uncategorized", 1],
      ]
    )
  })

  it("groups by payment method", () => {
    const groups = groupSubscriptions(
      [
        subscription({
          id: "sub-1",
          paymentMethod: {
            type: "CARD",
            id: "card-1",
            name: "Visa BHD",
            institution: null,
            last4: "1234",
            logoUrl: null,
          },
        }),
        subscription({ id: "sub-2" }),
      ],
      "provider"
    )
    assert.deepEqual(
      groups.map((group) => group.label),
      ["Visa BHD", "Sin método"]
    )
  })
})

describe("breakdownFilter", () => {
  it("maps instrument keys to card and account filters", () => {
    assert.deepEqual(breakdownFilter("instrument", "CARD:card-1"), {
      cardId: "card-1",
    })
    assert.deepEqual(breakdownFilter("instrument", "ACCOUNT:acc-1"), {
      accountId: "acc-1",
    })
    assert.equal(breakdownFilter("instrument", "no-instrument"), null)
  })

  it("maps category and currency keys", () => {
    assert.deepEqual(breakdownFilter("category", "cat-1"), {
      categoryId: "cat-1",
    })
    assert.equal(breakdownFilter("category", "uncategorized"), null)
    assert.deepEqual(breakdownFilter("currency", "USD"), { currency: "USD" })
  })
})

describe("buildSubscriptionSlices", () => {
  it("computes the share of each group", () => {
    const slices = buildSubscriptionSlices(
      [
        { key: "a", label: "A", color: "#f00", count: 1, amount: "75.00" },
        { key: "b", label: "B", color: null, count: 1, amount: "25.00" },
      ],
      { currency: "DOP", showCents: false, compactNumbers: false }
    )
    assert.equal(slices[0]?.percentLabel, "75%")
    assert.equal(slices[1]?.percentLabel, "25%")
    assert.equal(slices[0]?.amountLabel, "DOP $75")
  })
})

describe("subscriptionPayloadFromPattern", () => {
  function pattern(frequency: FinanceRecurringPattern["frequency"]) {
    return {
      id: "pattern-1",
      merchantName: "Netflix",
      avgAmount: "12.99",
      currency: "USD",
      nextExpectedDate: "2026-11-01",
      frequency,
    } as FinanceRecurringPattern
  }

  it("maps a weekly charge", () => {
    const payload = subscriptionPayloadFromPattern(pattern(7))
    assert.equal(payload.billingCycle, "WEEKLY")
    assert.equal(payload.billingInterval, 1)
  })

  it("maps a biweekly charge to a weekly cycle every two", () => {
    const payload = subscriptionPayloadFromPattern(pattern(14))
    assert.equal(payload.billingCycle, "WEEKLY")
    assert.equal(payload.billingInterval, 2)
  })

  it("maps monthly and yearly charges", () => {
    assert.equal(
      subscriptionPayloadFromPattern(pattern(30)).billingCycle,
      "MONTHLY"
    )
    assert.equal(
      subscriptionPayloadFromPattern(pattern(365)).billingCycle,
      "YEARLY"
    )
    const payload = subscriptionPayloadFromPattern(pattern(30))
    assert.equal(payload.sourcePatternId, "pattern-1")
    assert.equal(payload.amount, 12.99)
  })
})

describe("alertOccurrenceLabel", () => {
  it("describes the countdown and the missed charge date", () => {
    assert.equal(
      alertOccurrenceLabel({
        id: "a",
        kind: "TRIAL_ENDING",
        subscriptionId: "s",
        subscriptionName: "Netflix",
        date: "2026-10-30",
        currency: "DOP",
        amount: null,
        previousAmount: null,
        percent: null,
        daysUntil: 2,
      }),
      "En 2 días"
    )
    assert.equal(
      alertOccurrenceLabel({
        id: "a",
        kind: "MISSED_CHARGE",
        subscriptionId: "s",
        subscriptionName: "Netflix",
        date: "2026-10-20",
        currency: "DOP",
        amount: null,
        previousAmount: null,
        percent: null,
        daysUntil: -8,
      }),
      "Esperado el 2026-10-20"
    )
  })
})
