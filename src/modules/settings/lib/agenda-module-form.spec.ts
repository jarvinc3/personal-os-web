import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { agendaModuleSchema } from "./agenda-module-form.ts"

const validAgenda = {
  defaultView: "week" as const,
  weekStartsOn: "1" as const,
  defaultReminderMinutes: 30,
  workingHoursEnabled: true,
  eventReminders: true,
  dailyAgenda: false,
}

describe("agendaModuleSchema", () => {
  it("accepts a valid agenda config", () => {
    assert.equal(agendaModuleSchema.safeParse(validAgenda).success, true)
  })

  it("rejects a reminder above two hours", () => {
    assert.equal(
      agendaModuleSchema.safeParse({
        ...validAgenda,
        defaultReminderMinutes: 200,
      }).success,
      false
    )
  })
})
