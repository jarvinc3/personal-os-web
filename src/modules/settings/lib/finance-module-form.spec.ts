import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  EMAIL_SYNC_SCHEDULE_MODES,
  financeModuleSchema,
} from "./finance-module-form.ts"

const validFinance = {
  weekStartsOn: "1" as const,
  dashboardPeriod: "month" as const,
  showCents: true,
  compactNumbers: false,
  emailSyncEnabled: true,
  emailSyncAutomatic: true,
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
})
