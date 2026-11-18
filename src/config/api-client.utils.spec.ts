import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  mapStatusToError,
  parseRetryAfterHeader,
} from "@/src/config/api-client.utils"

describe("Retry-After", () => {
  it("lee la espera en segundos", () => {
    assert.equal(parseRetryAfterHeader("3"), 3_000)
    assert.equal(parseRetryAfterHeader("0"), 0)
  })

  it("lee la espera como fecha HTTP", () => {
    const now = Date.parse("2026-10-30T12:00:00.000Z")

    assert.equal(
      parseRetryAfterHeader("Fri, 30 Oct 2026 12:00:05 GMT", now),
      5_000
    )
    assert.equal(parseRetryAfterHeader("Fri, 30 Oct 2026 11:59:00 GMT", now), 0)
  })

  it("ignora una cabecera ausente o inválida", () => {
    assert.equal(parseRetryAfterHeader(null), undefined)
    assert.equal(parseRetryAfterHeader(""), undefined)
    assert.equal(parseRetryAfterHeader("later"), undefined)
  })
})

describe("mapStatusToError", () => {
  it("lleva los details del cuerpo al error", () => {
    const error = mapStatusToError(409, {
      message: "Ya hay un pago parecido importado por correo.",
      code: "CARD_PAYMENT_POSSIBLE_DUPLICATE",
      path: "/api/finance/card-payments",
      details: {
        matchedBy: "SIMILAR",
        candidate: { amount: "2500", currency: "DOP" },
      },
    })

    assert.equal(error.status, 409)
    assert.equal(error.code, "CARD_PAYMENT_POSSIBLE_DUPLICATE")
    assert.deepEqual(error.details, {
      matchedBy: "SIMILAR",
      candidate: { amount: "2500", currency: "DOP" },
    })
  })

  it("conserva el comercio que ya tiene el nombre", () => {
    const error = mapStatusToError(409, {
      message: "Ese nombre ya existe",
      existingMerchantId: "merchant-1",
    })

    assert.equal(error.existingMerchantId, "merchant-1")
    assert.equal(error.details, null)
  })
})
