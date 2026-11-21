import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  AGENT_CONVERSATIONS_PAGE_SIZE,
  buildAgentConversationsPath,
} from "./agent-conversations-request.ts"

const BASE = "/intelligence/conversations"

describe("buildAgentConversationsPath", () => {
  it("pide la primera tanda con el tope de la hoja", () => {
    assert.equal(
      buildAgentConversationsPath({}),
      `${BASE}?limit=${AGENT_CONVERSATIONS_PAGE_SIZE}`
    )
  })

  it("agrega el cursor de la página anterior", () => {
    assert.equal(
      buildAgentConversationsPath({ cursor: "abc123" }),
      `${BASE}?limit=${AGENT_CONVERSATIONS_PAGE_SIZE}&cursor=abc123`
    )
  })

  it("sin cursor no manda el parámetro", () => {
    assert.doesNotMatch(
      buildAgentConversationsPath({ cursor: null }),
      /cursor=/
    )
    assert.doesNotMatch(buildAgentConversationsPath({ cursor: "" }), /cursor=/)
  })
})
