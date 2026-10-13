import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  EMAIL_SYNC_SCHEDULE_MODES,
  financeModuleSchema,
  parsePayDays,
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
  emailSyncEnabled: true,
  emailSyncAutomatic: true,
  emailSyncMode: "DIRECT" as const,
  emailSyncScheduleMode: EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
  emailSyncEveryMinutes: "15",
  emailSyncTimes: [],
  autoCategorize: true,
  budgetAlerts: true,
  aiSuggestions: true,
  transactionDetected: true,
  monthlyReport: true,
  cardDueDate: true,
  unusualExpense: true,
}

describe("financeModuleSchema", () => {
  it("accepts an interval of at least fifteen minutes", () => {
    assert.equal(financeModuleSchema.safeParse(validFinance).success, true)
  })

  it("rejects an interval below fifteen minutes", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        emailSyncEveryMinutes: "5",
      }).success,
      false
    )
  })

  it("rejects an empty time list in times mode", () => {
    assert.equal(
      financeModuleSchema.safeParse({
        ...validFinance,
        emailSyncScheduleMode: EMAIL_SYNC_SCHEDULE_MODES.TIMES,
        emailSyncTimes: [],
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
