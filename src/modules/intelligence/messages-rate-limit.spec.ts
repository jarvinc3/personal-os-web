import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { ApiError } from "@/src/config/api-client.utils"
import {
  getMessagesRateLimitError,
  messagesRateLimitDelayMs,
} from "@/src/modules/intelligence/messages-rate-limit"

describe("límite de peticiones de la lista de correos", () => {
  it("solo trata un 429 como límite de peticiones", () => {
    assert.equal(getMessagesRateLimitError(new ApiError(500, "boom")), null)
    assert.equal(
      getMessagesRateLimitError(new ApiError(429, "demasiadas solicitudes"))
        ?.status,
      429
    )
  })

  it("respeta Retry-After cuando el servidor lo envía", () => {
    const error = new ApiError(
      429,
      "demasiadas solicitudes",
      "TOO_MANY_REQUESTS",
      undefined,
      undefined,
      { retryAfterMs: 7_000 }
    )

    assert.equal(messagesRateLimitDelayMs({ error, attempt: 0 }), 7_000)
    assert.equal(messagesRateLimitDelayMs({ error, attempt: 1 }), 7_000)
  })

  it("usa un retroceso exponencial acotado sin Retry-After", () => {
    const error = new ApiError(429, "demasiadas solicitudes")

    assert.equal(messagesRateLimitDelayMs({ error, attempt: 0 }), 2_000)
    assert.equal(messagesRateLimitDelayMs({ error, attempt: 1 }), 4_000)
    assert.equal(messagesRateLimitDelayMs({ error, attempt: 8 }), 30_000)
  })
})
