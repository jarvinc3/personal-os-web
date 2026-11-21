import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { normalizeUserPreferences } from "./normalize-preferences.ts"
import { DEFAULT_USER_PREFERENCES } from "@/src/modules/settings/constants/user-settings-defaults"
import {
  DEFAULT_APPEARANCE_STYLE,
  DEFAULT_PRIMARY_COLOR,
} from "@/src/shared/appearance"

describe("normalizeUserPreferences", () => {
  it("sin preferencias devuelve las de fábrica", () => {
    assert.deepEqual(normalizeUserPreferences(null), DEFAULT_USER_PREFERENCES)
    assert.deepEqual(
      normalizeUserPreferences(undefined),
      DEFAULT_USER_PREFERENCES
    )
  })

  it("un objeto vacío también devuelve las de fábrica", () => {
    assert.deepEqual(normalizeUserPreferences({}), DEFAULT_USER_PREFERENCES)
  })

  it("respeta lo elegido y completa lo que falta", () => {
    const preferences = normalizeUserPreferences({
      theme: { value: "dark" },
    })

    assert.equal(preferences.theme.value, "dark")
    assert.equal(preferences.theme.style, DEFAULT_USER_PREFERENCES.theme.style)
    assert.equal(
      preferences.notifications.quietHours.start,
      DEFAULT_USER_PREFERENCES.notifications.quietHours.start
    )
    assert.equal(preferences.onboarding.completed, false)
  })

  it("migra a la versión vigente un estilo o color inválido", () => {
    const preferences = normalizeUserPreferences({
      version: 1,
      theme: { value: "dark", style: "no-existe", primaryColor: "azul" },
    })

    assert.equal(preferences.version, DEFAULT_USER_PREFERENCES.version)
    assert.equal(preferences.theme.style, DEFAULT_APPEARANCE_STYLE)
    assert.equal(preferences.theme.primaryColor, DEFAULT_PRIMARY_COLOR)
    assert.equal(preferences.theme.value, "dark")
  })
})
