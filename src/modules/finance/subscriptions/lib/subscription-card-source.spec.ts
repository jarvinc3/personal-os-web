import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceSubscription,
  FinanceSubscriptionUpcomingCharge,
} from "@/src/modules/finance/shared/types/entities"
import {
  upcomingChargeToCardSource,
  type SubscriptionCardSource,
} from "./subscription-card-source.ts"

const charge: FinanceSubscriptionUpcomingCharge = {
  id: "sub-1:2026-11-05",
  subscriptionId: "sub-1",
  name: "Netflix",
  logoUrl: null,
  amount: "580.00",
  currency: "DOP",
  date: "2026-11-05",
  daysUntil: 13,
  paymentMethod: {
    type: "CARD",
    id: "card-1",
    name: "Visa Ejemplo",
    institution: "Banco Ejemplo",
    last4: "4821",
    logoUrl: null,
  },
}

describe("upcomingChargeToCardSource", () => {
  it("keeps the subscription, the charge date and the money of the charge", () => {
    const source = upcomingChargeToCardSource(charge)

    assert.equal(source.id, "sub-1")
    assert.equal(source.name, "Netflix")
    assert.equal(source.amount, "580.00")
    assert.equal(source.currency, "DOP")
    assert.equal(source.nextBillingDate, "2026-11-05")
    assert.equal(source.paymentMethod?.last4, "4821")
  })

  it("marks the charge as an active subscription without a billing cycle", () => {
    const source = upcomingChargeToCardSource(charge)

    assert.equal(source.status, "ACTIVE")
    assert.equal(source.billingCycle, null)
    assert.equal(source.trialEndsAt, null)
    assert.equal(source.lastChargeMismatch, false)
    assert.equal(source.monthlyEquivalent, null)
  })

  it("accepts a full subscription without dropping any card field", () => {
    const subscription: FinanceSubscription = {
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
      nextBillingDate: "2026-11-05",
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
      daysUntil: 13,
      createdAt: "2026-01-10T12:00:00.000Z",
      updatedAt: "2026-10-20T12:00:00.000Z",
    }
    const source: SubscriptionCardSource = subscription

    assert.equal(source.billingCycle, "MONTHLY")
    assert.equal(source.monthlyEquivalent, "580.00")
  })
})
