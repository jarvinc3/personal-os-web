import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  subscriptionFormSchema,
  subscriptionPayload,
  toSubscriptionFormValues,
} from "./subscription-form.ts"

const baseValues = toSubscriptionFormValues(null, {
  defaultCurrency: "DOP",
  defaultReminderDays: 3,
})

describe("toSubscriptionFormValues", () => {
  it("uses the finance defaults when creating", () => {
    assert.equal(baseValues.currency, "DOP")
    assert.equal(baseValues.billingCycle, "MONTHLY")
    assert.equal(baseValues.billingInterval, "1")
    assert.equal(baseValues.reminderDaysBefore, "3")
    assert.equal(baseValues.cardId, CATALOG_NONE)
    assert.equal(baseValues.accountId, CATALOG_NONE)
    assert.equal(baseValues.sourcePatternId, "")
  })

  it("prefills from a detected recurring charge", () => {
    const draft = toSubscriptionFormValues(null, {
      defaultCurrency: "DOP",
      defaultReminderDays: 3,
      draft: {
        name: "Netflix",
        amount: "12.99",
        currency: "USD",
        sourcePatternId: "pattern-1",
      },
    })
    assert.equal(draft.name, "Netflix")
    assert.equal(draft.amount, "12.99")
    assert.equal(draft.currency, "USD")
    assert.equal(draft.sourcePatternId, "pattern-1")
  })
})

describe("subscriptionFormSchema", () => {
  it("rejects a reminder outside the 0-30 range", () => {
    const invalidParse = subscriptionFormSchema.safeParse({
      ...baseValues,
      reminderDaysBefore: "31",
    })
    assert.equal(invalidParse.success, false)
  })

  it("accepts a valid form", () => {
    const validParse = subscriptionFormSchema.safeParse({
      ...baseValues,
      name: "Netflix",
      amount: "12.99",
    })
    assert.equal(validParse.success, true)
  })
})

describe("subscriptionPayload", () => {
  it("maps the form to the REST body", () => {
    const payload = subscriptionPayload({
      ...baseValues,
      name: " Spotify ",
      amount: "10,50",
      currency: "usd",
      billingInterval: "2",
      reminderDaysBefore: "5",
      cardId: "card-1",
      trialEndsAt: "",
    })
    assert.equal(payload.name, "Spotify")
    assert.equal(payload.amount, 10.5)
    assert.equal(payload.currency, "USD")
    assert.equal(payload.billingInterval, 2)
    assert.equal(payload.reminderDaysBefore, 5)
    assert.equal(payload.cardId, "card-1")
    assert.equal(payload.trialEndsAt, undefined)
    assert.equal(payload.accountId, undefined)
  })

  it("keeps the source pattern when it came from a suggestion", () => {
    const payload = subscriptionPayload({
      ...baseValues,
      name: "Netflix",
      amount: "12.99",
      sourcePatternId: "pattern-1",
    })
    assert.equal(payload.sourcePatternId, "pattern-1")
  })
})
