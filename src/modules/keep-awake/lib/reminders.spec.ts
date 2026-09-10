import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_REMINDER,
  isReminderDue,
  markReminderFired,
  parseReminder,
  reminderDateKey,
} from "./reminders.ts"

const wednesdayNoon = new Date("2026-09-09T12:00:00")

describe("isReminderDue", () => {
  it("fires once when enabled at the matching local time", () => {
    const reminder = {
      ...DEFAULT_REMINDER,
      enabled: true,
      hour: 12,
      minute: 0,
      days: [3],
      lastFiredKey: null,
    }
    assert.equal(isReminderDue(reminder, wednesdayNoon), true)
  })

  it("does not fire on a different weekday or after already firing that day", () => {
    const reminder = {
      ...DEFAULT_REMINDER,
      enabled: true,
      hour: 12,
      minute: 0,
      days: [3],
      lastFiredKey: reminderDateKey(wednesdayNoon),
    }
    assert.equal(isReminderDue(reminder, wednesdayNoon), false)
    assert.equal(
      isReminderDue({ ...reminder, lastFiredKey: null, days: [1] }, wednesdayNoon),
      false
    )
  })

  it("treats an empty day list as every day", () => {
    const reminder = {
      ...DEFAULT_REMINDER,
      enabled: true,
      hour: 12,
      minute: 0,
      days: [],
      lastFiredKey: null,
    }
    assert.equal(isReminderDue(reminder, wednesdayNoon), true)
  })

  it("does not fire when disabled or at a different minute", () => {
    assert.equal(
      isReminderDue(
        { ...DEFAULT_REMINDER, enabled: false, hour: 12, minute: 0 },
        wednesdayNoon
      ),
      false
    )
    assert.equal(
      isReminderDue(
        { ...DEFAULT_REMINDER, enabled: true, hour: 12, minute: 1, days: [] },
        wednesdayNoon
      ),
      false
    )
  })
})

describe("markReminderFired", () => {
  it("stamps the local date so the reminder will not repeat until tomorrow", () => {
    const next = markReminderFired(DEFAULT_REMINDER, wednesdayNoon)
    assert.equal(next.lastFiredKey, "2026-09-09")
    assert.equal(isReminderDue({ ...next, enabled: true, hour: 12, minute: 0, days: [] }, wednesdayNoon), false)
  })
})

describe("parseReminder", () => {
  it("returns the default reminder for empty or invalid payloads", () => {
    assert.deepEqual(parseReminder(null), DEFAULT_REMINDER)
    assert.equal(parseReminder("{").enabled, false)
  })
})
