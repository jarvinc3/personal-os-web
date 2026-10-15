import { test } from "node:test"
import assert from "node:assert/strict"
import { scrubSentryEvent, SENTRY_REDACTED_VALUE } from "./sentry-scrubber.ts"

test("returns the event untouched when there is no request", () => {
  const event = { message: "boom" }

  assert.equal(scrubSentryEvent(event as never), event)
})

test("drops the whole request body", () => {
  const event = {
    request: { method: "POST", data: { amount: "1000.00" } },
  }

  assert.equal(scrubSentryEvent(event as never).request?.data, undefined)
})

test("removes authorization and cookie headers", () => {
  const event = {
    request: {
      headers: {
        Authorization: "Bearer secret",
        Cookie: "session=abc",
        "Content-Type": "application/json",
      },
    },
  }

  assert.deepEqual(scrubSentryEvent(event as never).request?.headers, {
    "Content-Type": "application/json",
  })
})

test("redacts token-like header values", () => {
  const event = {
    request: { headers: { "X-Api-Key": "abc", "X-Request-Id": "req-1" } },
  }

  assert.deepEqual(scrubSentryEvent(event as never).request?.headers, {
    "X-Api-Key": SENTRY_REDACTED_VALUE,
    "X-Request-Id": "req-1",
  })
})

test("removes cookies and redacts tokens in an object query string", () => {
  const event = {
    request: {
      cookies: { session: "abc" },
      query_string: { access_token: "abc", page: "1" },
    },
  }

  const scrubbed = scrubSentryEvent(event as never)

  assert.equal(scrubbed.request?.cookies, undefined)
  assert.deepEqual(scrubbed.request?.query_string, {
    access_token: SENTRY_REDACTED_VALUE,
    page: "1",
  })
})

test("redacts tokens in a raw query string and keeps other params", () => {
  const event = { request: { query_string: "?token=abc&page=1" } }

  assert.equal(
    scrubSentryEvent(event as never).request?.query_string,
    "?token=%5BFiltered%5D&page=1"
  )
})
