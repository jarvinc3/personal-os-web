import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceSubscription,
  FinanceSubscriptionAlert,
  FinanceSubscriptionSummary,
} from "@/src/modules/finance/shared/types/entities"
import {
  SUBSCRIPTION_DETAIL_TABS,
  billingCycleLabel,
  subscriptionAlertReviewTarget,
  subscriptionAlertView,
  subscriptionCardState,
  subscriptionDetailTabFromParam,
  subscriptionShortcutBadges,
  subscriptionStatusVariant,
  withSubscriptionDetailTab,
} from "./subscription-display.ts"

const display = {
  currency: "DOP",
  showCents: false,
  compactNumbers: false,
}

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
    amount: "580.00",
    currency: "DOP",
    billingCycle: "MONTHLY",
    billingInterval: 1,
    anchorDate: "2026-09-14",
    nextBillingDate: "2026-10-14",
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
    monthlyEquivalent: "580.00",
    annualEquivalent: "6960.00",
    daysUntil: 0,
    createdAt: "2023-03-12T00:00:00.000Z",
    updatedAt: "2026-10-14T00:00:00.000Z",
    ...overrides,
  }
}

function alert(
  overrides: Partial<FinanceSubscriptionAlert> = {}
): FinanceSubscriptionAlert {
  return {
    id: "alert-1",
    kind: "PRICE_INCREASE",
    subscriptionId: "sub-1",
    subscriptionName: "Netflix",
    date: "2026-10-14",
    currency: "DOP",
    amount: "580.00",
    previousAmount: "520.00",
    expectedAmount: null,
    percent: 11.5,
    daysUntil: null,
    ...overrides,
  }
}

function summary(
  overrides: Partial<FinanceSubscriptionSummary> = {}
): FinanceSubscriptionSummary {
  return {
    baseCurrency: "DOP",
    activeCount: 9,
    monthlyCost: "4860.00",
    annualCost: "58320.00",
    previousMonthlyCost: "4800.00",
    realSpendThisMonth: "4860.00",
    realSpendPreviousMonth: "0.00",
    trend: null,
    pendingDetectedCount: 0,
    cancelledAnnualSavings: "0.00",
    reminderWindowDays: 5,
    upcoming: [],
    ...overrides,
  }
}

describe("billingCycleLabel", () => {
  it("labels the cycle and the interval", () => {
    assert.equal(billingCycleLabel("MONTHLY", 1), "Mensual")
    assert.equal(billingCycleLabel("MONTHLY", 2), "Mensual cada 2")
    assert.equal(billingCycleLabel("YEARLY", 1), "Anual")
  })
})

describe("subscriptionStatusVariant", () => {
  it("maps each status to a badge variant", () => {
    assert.equal(subscriptionStatusVariant("ACTIVE"), "success")
    assert.equal(subscriptionStatusVariant("PAUSED"), "warning")
    assert.equal(subscriptionStatusVariant("CANCELLED"), "secondary")
  })
})

describe("subscriptionCardState", () => {
  it("labels a charge inside the window and marks it", () => {
    const state = subscriptionCardState({
      subscription: subscription(),
      today: day(2026, 10, 14),
      windowDays: 5,
    })
    assert.equal(state.label, "Hoy")
    assert.equal(state.inWindow, true)
  })

  it("uses the short date and no highlight outside the window", () => {
    const state = subscriptionCardState({
      subscription: subscription({ nextBillingDate: "2026-10-22" }),
      today: day(2026, 10, 14),
      windowDays: 5,
    })
    assert.equal(state.label, "22 oct")
    assert.equal(state.inWindow, false)
  })

  it("takes the warning mark from the last charge", () => {
    assert.equal(
      subscriptionCardState({
        subscription: subscription({ lastChargeMismatch: true }),
        today: day(2026, 10, 14),
        windowDays: 5,
      }).warnLastCharge,
      true
    )
  })

  it("does not highlight a subscription that does not bill", () => {
    const paused = subscriptionCardState({
      subscription: subscription({
        status: "PAUSED",
        nextBillingDate: "2026-10-15",
      }),
      today: day(2026, 10, 14),
      windowDays: 5,
    })
    assert.equal(paused.inWindow, false)
    assert.equal(paused.label, "15 oct")

    const cancelled = subscriptionCardState({
      subscription: subscription({
        status: "CANCELLED",
        nextBillingDate: "2026-10-14",
      }),
      today: day(2026, 10, 14),
      windowDays: 5,
    })
    assert.equal(cancelled.inWindow, false)
    assert.equal(cancelled.label, "14 oct")
  })

  it("marks a free trial that has not ended", () => {
    assert.equal(
      subscriptionCardState({
        subscription: subscription({ trialEndsAt: "2026-10-28" }),
        today: day(2026, 10, 14),
        windowDays: 5,
      }).onTrial,
      true
    )
    assert.equal(
      subscriptionCardState({
        subscription: subscription({ trialEndsAt: "2026-10-01" }),
        today: day(2026, 10, 14),
        windowDays: 5,
      }).onTrial,
      false
    )
  })
})

describe("detail tab of the URL", () => {
  it("reads the tab a link asks for and falls back to summary", () => {
    assert.equal(
      subscriptionDetailTabFromParam("price"),
      SUBSCRIPTION_DETAIL_TABS.price
    )
    assert.equal(
      subscriptionDetailTabFromParam("payments"),
      SUBSCRIPTION_DETAIL_TABS.payments
    )
    assert.equal(
      subscriptionDetailTabFromParam("summary"),
      SUBSCRIPTION_DETAIL_TABS.summary
    )
    assert.equal(
      subscriptionDetailTabFromParam(null),
      SUBSCRIPTION_DETAIL_TABS.summary
    )
    assert.equal(
      subscriptionDetailTabFromParam("oops"),
      SUBSCRIPTION_DETAIL_TABS.summary
    )
  })

  it("writes the tab and drops the default one", () => {
    assert.equal(
      withSubscriptionDetailTab("tab=price", SUBSCRIPTION_DETAIL_TABS.payments),
      "tab=payments"
    )
    assert.equal(
      withSubscriptionDetailTab(
        "tab=price&sheet=alerts",
        SUBSCRIPTION_DETAIL_TABS.summary
      ),
      "sheet=alerts"
    )
    assert.equal(
      withSubscriptionDetailTab("", SUBSCRIPTION_DETAIL_TABS.price),
      "tab=price"
    )
  })
})

describe("subscriptionShortcutBadges", () => {
  it("reads the badges of the four shortcuts", () => {
    assert.deepEqual(
      subscriptionShortcutBadges({
        summary: summary({
          upcoming: [subscription()],
          pendingDetectedCount: 2,
        }),
        alertCount: 3,
      }),
      { upcoming: true, alerts: 3, detected: 2 }
    )
  })

  it("shows nothing while the summary has not arrived", () => {
    assert.deepEqual(
      subscriptionShortcutBadges({ summary: undefined, alertCount: 0 }),
      { upcoming: false, alerts: 0, detected: 0 }
    )
  })
})

describe("subscriptionAlertView", () => {
  it("describes a price increase with the old and new amount", () => {
    const view = subscriptionAlertView({ alert: alert(), display })
    assert.equal(view.title, "Netflix subió de precio")
    assert.equal(
      view.description,
      "DOP $520 → DOP $580 · desde el cobro del 2026-10-14"
    )
    assert.equal(view.badge, "+11.5%")
    assert.equal(view.badgeVariant, "danger")
  })

  it("describes a charge that does not match the expected amount", () => {
    const view = subscriptionAlertView({
      alert: alert({
        kind: "AMOUNT_MISMATCH",
        amount: "165.00",
        previousAmount: null,
        expectedAmount: "140.00",
        percent: null,
      }),
      display,
    })
    assert.equal(view.title, "Netflix cobró distinto")
    assert.equal(
      view.description,
      "Esperado DOP $140 · cobrado DOP $165 el 2026-10-14"
    )
    assert.equal(view.badge, "+DOP $25")
    assert.equal(view.badgeVariant, "warning")
  })

  it("describes a charge that never arrived", () => {
    const view = subscriptionAlertView({
      alert: alert({
        kind: "MISSED_CHARGE",
        previousAmount: null,
        percent: null,
        daysUntil: -8,
      }),
      display,
    })
    assert.equal(view.title, "Netflix: cobro no registrado")
    assert.equal(view.badge, "Sin registrar")
  })

  it("counts down a trial and a renewal", () => {
    const trial = subscriptionAlertView({
      alert: alert({
        kind: "TRIAL_ENDING",
        previousAmount: null,
        percent: null,
        daysUntil: 2,
      }),
      display,
    })
    assert.equal(trial.badge, "en 2 días")

    const renewal = subscriptionAlertView({
      alert: alert({
        kind: "ANNUAL_RENEWAL",
        previousAmount: null,
        percent: null,
        daysUntil: 0,
      }),
      display,
    })
    assert.equal(renewal.badge, "Hoy")
  })
})

describe("subscriptionAlertReviewTarget", () => {
  it("opens the tab that explains the alert", () => {
    assert.equal(
      subscriptionAlertReviewTarget("PRICE_INCREASE"),
      SUBSCRIPTION_DETAIL_TABS.price
    )
    assert.equal(
      subscriptionAlertReviewTarget("AMOUNT_MISMATCH"),
      SUBSCRIPTION_DETAIL_TABS.price
    )
    assert.equal(
      subscriptionAlertReviewTarget("MISSED_CHARGE"),
      SUBSCRIPTION_DETAIL_TABS.payments
    )
    assert.equal(
      subscriptionAlertReviewTarget("ANNUAL_RENEWAL"),
      SUBSCRIPTION_DETAIL_TABS.summary
    )
  })
})
