import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults.ts"
import { mergeUserPreferences } from "./merge-user-preferences.ts"

describe("mergeUserPreferences", () => {
  it("keeps the other channels when one changes", () => {
    const merged = mergeUserPreferences(DEFAULT_USER_PREFERENCES, {
      notifications: { channels: { inApp: false } },
    })

    assert.equal(merged.notifications.channels.inApp, false)
    assert.equal(
      merged.notifications.channels.push,
      DEFAULT_USER_PREFERENCES.notifications.channels.push
    )
    assert.equal(
      merged.notifications.channels.email,
      DEFAULT_USER_PREFERENCES.notifications.channels.email
    )
    assert.equal(
      merged.notifications.quietHours.start,
      DEFAULT_USER_PREFERENCES.notifications.quietHours.start
    )
  })

  it("applies a leaf patch over the defaults when there is no current profile", () => {
    const merged = mergeUserPreferences(null, { ai: { tone: "detailed" } })

    assert.equal(merged.ai.tone, "detailed")
    assert.equal(
      merged.ai.proactiveInsights,
      DEFAULT_USER_PREFERENCES.ai.proactiveInsights
    )
    assert.equal(merged.ai.fieldGuide, DEFAULT_USER_PREFERENCES.ai.fieldGuide)
  })
})
