import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { normalizeFormatLocale } from "./format-locale.ts"

describe("normalizeFormatLocale", () => {
  it("keeps the supported tags", () => {
    assert.equal(normalizeFormatLocale("es-DO"), "es-DO")
    assert.equal(normalizeFormatLocale(" en-US "), "en-US")
  })

  it("falls back to the product default for missing or malformed values", () => {
    assert.equal(normalizeFormatLocale(null), "es-DO")
    assert.equal(normalizeFormatLocale(undefined), "es-DO")
    assert.equal(normalizeFormatLocale("es_DO"), "es-DO")
    assert.equal(normalizeFormatLocale("not a locale"), "es-DO")
  })
})
