import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { localeLabel } from "./locale-options.ts"

describe("localeLabel", () => {
  it("names a known locale", () => {
    assert.equal(localeLabel("en-US"), "English (United States)")
  })

  it("keeps an unknown locale visible", () => {
    assert.equal(localeLabel("fr-FR"), "fr-FR")
  })

  it("falls back to the default when the profile has no locale", () => {
    assert.equal(localeLabel(null), "Español (República Dominicana)")
  })
})
