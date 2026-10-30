import assert from "node:assert/strict"
import { describe, it } from "node:test"

process.env.NEXT_PUBLIC_API_URL = "http://api.test"
process.env.NEXT_PUBLIC_API_PREFIX = "api"

const { createApiClient } = await import("@/src/config/api-client")

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type RecordedCall = {
  url: string
  init: RequestInit | undefined
}

function jsonResponse(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  })
}

function createFetchStub(responses: readonly Response[]) {
  const calls: RecordedCall[] = []
  const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init })
    const response = responses[Math.min(calls.length - 1, responses.length - 1)]
    return response.clone()
  }) as typeof fetch
  return { fetchImpl, calls }
}

function createClient(responses: readonly Response[]) {
  const { fetchImpl, calls } = createFetchStub(responses)
  return {
    client: createApiClient({
      resolveAccessToken: async () => "token-1",
      fetchImpl,
    }),
    calls,
  }
}

function idempotencyKeyOf(call: RecordedCall): string | null {
  return new Headers(call.init?.headers).get("Idempotency-Key")
}

describe("api client idempotency key", () => {
  it("sends an Idempotency-Key on POST, PATCH, DELETE and multipart POST", async () => {
    const { client, calls } = createClient([
      jsonResponse({ data: {} }),
      jsonResponse({ data: {} }),
      jsonResponse({ data: {} }),
      jsonResponse({ data: {} }),
    ])

    await client.apiPost("/finance/accounts", { name: "Efectivo" })
    await client.apiPatch("/finance/accounts/acc-1", { name: "Casa" })
    await client.apiDelete("/finance/accounts/acc-1")
    await client.apiPostForm("/finance/statements", new FormData())

    assert.equal(calls.length, 4)
    const keys = calls.map(idempotencyKeyOf)
    for (const key of keys) {
      assert.match(key ?? "", UUID_PATTERN)
    }
    assert.equal(new Set(keys).size, 4)
  })

  it("sends a DELETE body when the endpoint asks for confirmation", async () => {
    const { client, calls } = createClient([
      jsonResponse({ data: { deleted: true } }),
    ])

    const deletion = await client.apiDeleteWithBody<{ deleted: boolean }>(
      "/intelligence/knowledge/me",
      { confirmed: true }
    )

    assert.deepEqual(deletion, { deleted: true })
    assert.equal(calls.length, 1)
    assert.equal(calls[0].init?.method, "DELETE")
    assert.equal(calls[0].init?.body, JSON.stringify({ confirmed: true }))
    assert.match(idempotencyKeyOf(calls[0]) ?? "", UUID_PATTERN)
  })

  it("does not send the header on GET", async () => {
    const { client, calls } = createClient([jsonResponse({ data: {} })])

    await client.apiGet("/finance/accounts")

    assert.equal(calls.length, 1)
    assert.equal(idempotencyKeyOf(calls[0]), null)
  })

  it("reuses the same key in every retry of one request", async () => {
    const { client, calls } = createClient([
      jsonResponse({ message: "boom" }, 500),
      jsonResponse({ data: { ok: true } }),
    ])

    await client.apiPost("/finance/accounts", { name: "Efectivo" })

    assert.equal(calls.length, 2)
    const keys = calls.map(idempotencyKeyOf)
    assert.match(keys[0] ?? "", UUID_PATTERN)
    assert.equal(keys[0], keys[1])
  })

  it("generates a new key for each new call", async () => {
    const { client, calls } = createClient([
      jsonResponse({ data: {} }),
      jsonResponse({ data: {} }),
    ])

    await client.apiPost("/finance/accounts", { name: "Efectivo" })
    await client.apiPost("/finance/accounts", { name: "Efectivo" })

    const keys = calls.map(idempotencyKeyOf)
    assert.equal(calls.length, 2)
    assert.notEqual(keys[0], keys[1])
  })

  it("does not retry a 429 and exposes Retry-After", async () => {
    const { client, calls } = createClient([
      jsonResponse({ message: "Too many requests" }, 429, {
        "Retry-After": "3",
      }),
    ])

    await assert.rejects(
      () => client.apiGet("/intelligence/messages?limit=50"),
      (error: unknown) => {
        assert.ok(error instanceof Error)
        assert.equal((error as { status?: number }).status, 429)
        assert.equal((error as { retryAfterMs?: number }).retryAfterMs, 3_000)
        assert.match(error.message, /Too many requests/)
        return true
      }
    )
    assert.equal(calls.length, 1)
  })

  it("does not retry a 409 and surfaces it as ApiError", async () => {
    const { client, calls } = createClient([
      jsonResponse(
        { message: "Esa Idempotency-Key ya se usó con una petición distinta" },
        409
      ),
    ])

    await assert.rejects(
      () => client.apiPost("/finance/accounts", { name: "Efectivo" }),
      (error: unknown) => {
        assert.ok(error instanceof Error)
        assert.equal((error as { status?: number }).status, 409)
        assert.equal((error as { code?: string }).code, "CONFLICT")
        assert.match(error.message, /ya se usó/)
        return true
      }
    )
    assert.equal(calls.length, 1)
  })
})
