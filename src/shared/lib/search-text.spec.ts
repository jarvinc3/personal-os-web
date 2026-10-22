import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { foldSearchText } from "./search-text.ts"

describe("foldSearchText", () => {
  it("ignores case and accents", () => {
    assert.equal(foldSearchText("  Patrimonio Nêto "), "patrimonio neto")
    assert.equal(foldSearchText("UTILIZACIÓN"), "utilizacion")
  })

  it("leaves an empty search empty", () => {
    assert.equal(foldSearchText("   "), "")
  })
})
