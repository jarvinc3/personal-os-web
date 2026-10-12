import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { translateFinanceError } from "./finance-error-messages.ts"

const REQUEST_ERROR = "No se pudo guardar. Revisa los datos e intenta de nuevo."

describe("translateFinanceError", () => {
  it("translates a known backend message", () => {
    assert.equal(
      translateFinanceError(
        400,
        "Payment cannot exceed the outstanding amount"
      ),
      "El monto supera lo que queda por cobrar."
    )
  })

  it("translates a Gmail token failure by its prefix", () => {
    assert.equal(
      translateFinanceError(
        400,
        "Gmail tokens could not be decrypted for this source"
      ),
      "No se pudo leer el acceso a Gmail. Vuelve a conectar la cuenta."
    )
  })

  it("hides raw validation messages", () => {
    assert.equal(
      translateFinanceError(400, "categoryId must be a UUID"),
      REQUEST_ERROR
    )
  })

  it("hides unknown client-error messages", () => {
    assert.equal(
      translateFinanceError(409, "Unique constraint violation"),
      REQUEST_ERROR
    )
  })

  it("hides server errors", () => {
    assert.equal(
      translateFinanceError(500, "Internal server error"),
      "No se pudo guardar. Intenta de nuevo."
    )
  })
})
