import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { AgentChatOverlay } from "./agent-chat-overlay.tsx"

describe("AgentChatOverlay", () => {
  it("loads as its own module for the lazy host", () => {
    assert.equal(typeof AgentChatOverlay, "function")
  })
})
