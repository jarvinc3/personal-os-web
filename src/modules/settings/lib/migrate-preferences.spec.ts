import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults.ts"
import {
  migrateUserPreferences,
  USER_PREFERENCES_VERSION,
} from "@/src/modules/settings/lib/migrate-preferences.ts"
import type { UserPreferences } from "@/src/modules/settings/types/profile.types.ts"

function legacyPreferences(): UserPreferences {
  return {
    ...DEFAULT_USER_PREFERENCES,
    version: 1,
    theme: {
      fieldGuide: DEFAULT_USER_PREFERENCES.theme.fieldGuide,
      value: "dark",
    } as UserPreferences["theme"],
  }
}

describe("migrateUserPreferences", () => {
  it("completes the appearance of a v1 profile without touching the mode", () => {
    const migrated = migrateUserPreferences(legacyPreferences())

    assert.equal(migrated.version, USER_PREFERENCES_VERSION)
    assert.equal(migrated.theme.value, "dark")
    assert.equal(migrated.theme.style, "studio")
    assert.equal(migrated.theme.primaryColor, "#D6C5B3")
  })

  it("replaces an unknown style and an invalid color", () => {
    const migrated = migrateUserPreferences({
      ...DEFAULT_USER_PREFERENCES,
      theme: {
        ...DEFAULT_USER_PREFERENCES.theme,
        style: "unknown" as UserPreferences["theme"]["style"],
        primaryColor: "sand",
      },
    })

    assert.equal(migrated.theme.style, "studio")
    assert.equal(migrated.theme.primaryColor, "#D6C5B3")
  })

  it("normalizes a saved color to uppercase", () => {
    const migrated = migrateUserPreferences({
      ...DEFAULT_USER_PREFERENCES,
      theme: { ...DEFAULT_USER_PREFERENCES.theme, primaryColor: "#3f6a9a" },
    })

    assert.equal(migrated.theme.primaryColor, "#3F6A9A")
  })

  it("returns the same preferences when they are already current", () => {
    const current = migrateUserPreferences(DEFAULT_USER_PREFERENCES)

    assert.equal(current, DEFAULT_USER_PREFERENCES)
  })
})
