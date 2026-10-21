import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  resolveWeekStartsOn,
  weekStartsOnFromLocale,
  weekStartsOnLabel,
} from "./week-starts-on.ts"

describe("weekStartsOnFromLocale", () => {
  it("reads the first day from the locale", () => {
    assert.equal(weekStartsOnFromLocale("es-DO"), 0)
    assert.equal(weekStartsOnFromLocale("en-US"), 0)
    assert.equal(weekStartsOnFromLocale("es-ES"), 1)
    assert.equal(weekStartsOnFromLocale("ar-EG"), 6)
  })

  it("falls back to monday for a missing or malformed locale", () => {
    assert.equal(weekStartsOnFromLocale(null), 0)
    assert.equal(weekStartsOnFromLocale("not a locale"), 1)
    assert.equal(weekStartsOnFromLocale("es_DO"), 1)
  })
})

describe("resolveWeekStartsOn", () => {
  it("prefers the stored choice", () => {
    assert.equal(
      resolveWeekStartsOn({ stored: 6, locale: "es-DO", moduleFallback: 0 }),
      6
    )
  })

  it("uses the module value saved before the global preference", () => {
    assert.equal(
      resolveWeekStartsOn({ stored: null, locale: "es-ES", moduleFallback: 0 }),
      0
    )
  })

  it("uses the locale when nothing else is stored", () => {
    assert.equal(
      resolveWeekStartsOn({ stored: null, locale: "es-ES", moduleFallback: 1 }),
      1
    )
    assert.equal(resolveWeekStartsOn({ stored: null, locale: "es-DO" }), 0)
  })
})

describe("weekStartsOnLabel", () => {
  it("names the three supported days", () => {
    assert.equal(weekStartsOnLabel(0), "Domingo")
    assert.equal(weekStartsOnLabel(1), "Lunes")
    assert.equal(weekStartsOnLabel(6), "Sábado")
  })
})
