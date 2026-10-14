import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildChatContextParams,
  chatContextLabel,
  parseChatContextParams,
  toWireChatContext,
} from "./chat-context-params.ts"

describe("parseChatContextParams", () => {
  it("reads a full finance entity context", () => {
    const params = new URLSearchParams({
      module: "finance",
      screen: "loan-detail",
      entityType: "loan",
      entityId: "loan-1",
      entityLabel: "BHD",
    })

    assert.deepEqual(parseChatContextParams(params), {
      moduleSlug: "finance",
      screen: "loan-detail",
      entityRef: { type: "loan", id: "loan-1" },
      entityLabel: "BHD",
    })
  })

  it("ignores an unknown entity type", () => {
    const params = new URLSearchParams({
      module: "finance",
      entityType: "spaceship",
      entityId: "x",
    })

    assert.deepEqual(parseChatContextParams(params), {
      moduleSlug: "finance",
    })
  })

  it("falls back to the general module", () => {
    assert.deepEqual(parseChatContextParams(new URLSearchParams()), {
      moduleSlug: "general",
    })
  })
})

describe("buildChatContextParams", () => {
  it("round-trips a context", () => {
    const context = {
      moduleSlug: "finance",
      screen: "budget-detail",
      entityRef: { type: "budget" as const, id: "budget-1" },
      entityLabel: "Comida",
    }

    const params = buildChatContextParams(context)

    assert.deepEqual(parseChatContextParams(params), context)
  })

  it("writes only the general module when there is no context", () => {
    const params = buildChatContextParams(null)

    assert.equal(params.get("module"), "general")
    assert.equal(params.get("entityType"), null)
  })
})

describe("toWireChatContext", () => {
  it("drops the local label and keeps type and id", () => {
    const context = {
      moduleSlug: "finance",
      screen: "loan-detail",
      entityRef: { type: "loan" as const, id: "loan-1" },
      entityLabel: "BHD",
    }

    assert.deepEqual(toWireChatContext(context), {
      moduleSlug: "finance",
      screen: "loan-detail",
      entityRef: { type: "loan", id: "loan-1" },
    })
  })

  it("returns null for no context", () => {
    assert.equal(toWireChatContext(null), null)
  })
})

describe("chatContextLabel", () => {
  it("prefers the registered label", () => {
    assert.equal(
      chatContextLabel({
        moduleSlug: "finance",
        entityRef: { type: "loan", id: "loan-1" },
        entityLabel: "BHD",
      }),
      "BHD"
    )
  })

  it("falls back to the type label", () => {
    assert.equal(
      chatContextLabel({
        moduleSlug: "finance",
        entityRef: { type: "loan", id: "loan-1" },
      }),
      "Préstamo"
    )
  })

  it("returns null without an entity", () => {
    assert.equal(chatContextLabel({ moduleSlug: "finance" }), null)
  })
})
