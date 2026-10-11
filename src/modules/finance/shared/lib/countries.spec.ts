import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { COUNTRY_OPTIONS, countryName } from "./countries.ts"

describe("countryName", () => {
  it("names a known code", () => {
    const name = countryName("DO")
    assert.equal(name.length > 0, true)
    assert.notEqual(name, "DO")
  })

  it("returns the code when it is not in the ISO list", () => {
    assert.equal(countryName("zz"), "ZZ")
  })
})

describe("COUNTRY_OPTIONS", () => {
  it("lists the codes the form can send", () => {
    assert.equal(
      COUNTRY_OPTIONS.some((option) => option.code === "DO"),
      true
    )
  })
})
