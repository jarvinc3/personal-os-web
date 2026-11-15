import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { countLabel } from "./count-label.ts"

describe("countLabel", () => {
  it("uses the singular for one", () => {
    assert.equal(countLabel(1, "account"), "1 cuenta")
    assert.equal(countLabel(1, "installment"), "1 cuota")
  })

  it("uses the plural for zero and more than one", () => {
    assert.equal(countLabel(0, "account"), "0 cuentas")
    assert.equal(countLabel(2, "loan"), "2 préstamos")
  })

  it("counts emails and proposals for the detected products", () => {
    assert.equal(countLabel(1, "message"), "1 correo")
    assert.equal(countLabel(3, "message"), "3 correos")
    assert.equal(countLabel(1, "proposal"), "1 propuesta")
    assert.equal(countLabel(0, "proposal"), "0 propuestas")
  })
})
