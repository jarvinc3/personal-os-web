import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  EMAIL_SYNC_SCHEDULE_MODES,
  emailSyncOnboardingDefaults,
  emailSyncPatchFromFormValues,
  emailSyncScheduleLabel,
  emailSyncTimesFromSchedule,
  financeModuleSchema,
  isEmailSyncConfigured,
  parsePayDays,
  parseSyncIntervalMinutes,
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

describe("emailSyncOnboardingDefaults", () => {
  it("turns automatic sync on and keeps the saved mode and schedule", () => {
    const defaults = emailSyncOnboardingDefaults({
      automatic: false,
      mode: "PENDING",
      schedule: { mode: "times", times: ["07:30", "19:30"] },
    })

    assert.equal(defaults.emailSyncAutomatic, true)
    assert.equal(defaults.emailSyncMode, "PENDING")
    assert.equal(
      defaults.emailSyncScheduleMode,
      EMAIL_SYNC_SCHEDULE_MODES.TIMES
    )
    assert.deepEqual(defaults.emailSyncTimes, ["07:30", "19:30"])
  })

  it("keeps the interval and proposes default times as fallback", () => {
    const defaults = emailSyncOnboardingDefaults({
      automatic: true,
      mode: "DIRECT",
      schedule: { mode: "interval", everyMinutes: 15 },
    })

    assert.equal(defaults.emailSyncAutomatic, true)
    assert.equal(
      defaults.emailSyncScheduleMode,
      EMAIL_SYNC_SCHEDULE_MODES.INTERVAL
    )
    assert.equal(defaults.emailSyncEveryMinutes, "15")
    assert.deepEqual(defaults.emailSyncTimes, ["08:00", "18:00"])
  })

  it("does not propose an empty time list for a times schedule", () => {
    assert.deepEqual(emailSyncTimesFromSchedule({ mode: "times", times: [] }), [
      "08:00",
      "18:00",
    ])
  })
})

describe("emailSyncScheduleLabel", () => {
  it("labels an interval schedule", () => {
    assert.equal(
      emailSyncScheduleLabel({ mode: "interval", everyMinutes: 15 }),
      "Cada 15 min"
    )
    assert.equal(
      emailSyncScheduleLabel({ mode: "interval", everyMinutes: 60 }),
      "Cada 1 h"
    )
    assert.equal(
      emailSyncScheduleLabel({ mode: "interval", everyMinutes: 90 }),
      "Cada 1 h 30 min"
    )
  })

  it("labels a fixed-times schedule", () => {
    assert.equal(
      emailSyncScheduleLabel({ mode: "times", times: ["08:00", "18:00"] }),
      "A las 08:00, 18:00"
    )
  })
})

describe("parseSyncIntervalMinutes", () => {
  it("falls back to the default below the fifteen-minute minimum", () => {
    assert.equal(parseSyncIntervalMinutes("5"), 360)
    assert.equal(parseSyncIntervalMinutes("abc"), 360)
    assert.equal(parseSyncIntervalMinutes("15"), 15)
    assert.equal(parseSyncIntervalMinutes("60"), 60)
  })
})

describe("isEmailSyncConfigured", () => {
  it("is true only when automatic sync is on", () => {
    assert.equal(isEmailSyncConfigured({ automatic: true }), true)
    assert.equal(isEmailSyncConfigured({ automatic: false }), false)
  })
})

describe("emailSyncPatchFromFormValues", () => {
  it("builds an interval schedule in minutes", () => {
    const patch = emailSyncPatchFromFormValues({
      ...validFinance,
      emailSyncMode: "PENDING",
      emailSyncScheduleMode: EMAIL_SYNC_SCHEDULE_MODES.INTERVAL,
      emailSyncEveryMinutes: "60",
    })

    assert.equal(patch.mode, "PENDING")
    assert.equal(patch.enabled, true)
    assert.deepEqual(patch.schedule, { mode: "interval", everyMinutes: 60 })
  })

  it("builds a fixed-times schedule and drops empty entries", () => {
    const patch = emailSyncPatchFromFormValues({
      ...validFinance,
      emailSyncScheduleMode: EMAIL_SYNC_SCHEDULE_MODES.TIMES,
      emailSyncTimes: [" 08:00 ", "18:00", " "],
    })

    assert.deepEqual(patch.schedule, {
      mode: "times",
      times: ["08:00", "18:00"],
    })
  })
})
