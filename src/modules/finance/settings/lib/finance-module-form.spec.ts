import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  financeModuleSchema,
  parsePayDays,
  subscriptionsPatchFromFormValues,
} from "./finance-module-form.ts"

const validFinance = {
  weekStartsOn: "1" as const,
  dashboardPeriod: "month" as const,
  showCents: true,
  compactNumbers: false,
  amountEntry: "keyboard" as const,
  defaultAccountId: "",
  monthStartDay: "1",
  cardDueDaysBefore: "3",
  fixedIncomeEnabled: false,
  fixedIncomeAmount: "",
  fixedIncomeFrequency: "MONTHLY" as const,
  fixedIncomePayDays: "",
  fixedIncomeAccountId: "",
  budgetAlerts: true,
  aiSuggestions: true,
  transactionDetected: true,
  monthlyReport: true,
  weeklySummary: true,
  weeklySummaryDay: "1",
  cardDueDate: true,
  unusualExpense: true,
  recurringAlerts: true,
  subscriptionReminders: true,
  priceIncreaseAlerts: true,
  balanceIntegrity: true,
  subscriptionReminderDays: "3",
  subscriptionGroupBy: "none" as const,
}

describe("financeModuleSchema", () => {
  it("accepts an interval of at least fifteen minutes", () => {
    assert.equal(financeModuleSchema.safeParse(validFinance).success, true)
  })

  it("rejects subscription reminder days outside 0-30", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        subscriptionReminderDays: "31",
      }).success,
      false
    )
  })

  it("reads pay days without repeats", () => {
    assert.deepEqual(parsePayDays("15, 1 15"), [1, 15])
  })

  it("requires an amount and a pay day for the fixed income", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        fixedIncomeEnabled: true,
        fixedIncomeAmount: "0",
        fixedIncomePayDays: "",
      }).success,
      false
    )
  })

  it("accepts a fixed income with amount and pay days", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        fixedIncomeEnabled: true,
        fixedIncomeAmount: "45000",
        fixedIncomePayDays: "15, 30",
      }).success,
      true
    )
  })

  it("skips card due days when that alert is off", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        cardDueDate: false,
        cardDueDaysBefore: "99",
      }).success,
      true
    )
  })

  it("rejects card due days outside 0-30 when the alert is on", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        cardDueDate: true,
        cardDueDaysBefore: "99",
      }).success,
      false
    )
  })

  it("rejects a financial month start after the 28th", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        monthStartDay: "29",
      }).success,
      false
    )
  })
})

describe("subscriptionsPatchFromFormValues", () => {
  it("maps the reminder days and the grouping", () => {
    const patch = subscriptionsPatchFromFormValues({
      ...validFinance,
      subscriptionReminderDays: "5",
      subscriptionGroupBy: "provider",
    })
    assert.deepEqual(patch, { reminderDaysBefore: 5, groupBy: "provider" })
  })
})
