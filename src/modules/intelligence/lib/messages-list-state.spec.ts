import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveMessagesListState } from "./messages-list-state.ts"

const IDLE = {
  isPending: false,
  isError: false,
  hasRateLimitError: false,
  messageCount: 0,
} as const

describe("resolveMessagesListState", () => {
  it("shows the list as soon as there is a message", () => {
    assert.equal(resolveMessagesListState({ ...IDLE, messageCount: 3 }), "list")
  })

  it("keeps the list when a later page fails", () => {
    assert.equal(
      resolveMessagesListState({
        ...IDLE,
        isError: true,
        messageCount: 3,
      }),
      "list"
    )
  })

  it("shows the loading skeletons on the first load", () => {
    assert.equal(
      resolveMessagesListState({ ...IDLE, isPending: true }),
      "loading"
    )
  })

  it("shows the retry empty state when the first load fails", () => {
    assert.equal(resolveMessagesListState({ ...IDLE, isError: true }), "error")
  })

  it("shows the empty state when there are no messages", () => {
    assert.equal(resolveMessagesListState(IDLE), "empty")
  })

  it("hides the empty state while the rate limit notice explains the wait", () => {
    assert.equal(
      resolveMessagesListState({
        ...IDLE,
        isError: true,
        hasRateLimitError: true,
      }),
      "hidden"
    )
  })
})
