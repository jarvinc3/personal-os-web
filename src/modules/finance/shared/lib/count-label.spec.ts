import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { countLabel } from "./count-label.ts"

describe("countLabel", () => {
  it("uses the singular for one", () => {
    assert.equal(countLabel(1, "cuenta", "cuentas"), "1 cuenta")
  })

  it("uses the plural for zero and more than one", () => {
    assert.equal(countLabel(0, "cuenta", "cuentas"), "0 cuentas")
    assert.equal(countLabel(2, "cuenta", "cuentas"), "2 cuentas")
  })
})
