import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parseRetryAfterHeader } from "@/src/config/api-client.utils"

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
