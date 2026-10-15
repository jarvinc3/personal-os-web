import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveMessageBlocks } from "./resolve-message-blocks.ts"
import type { ChatBlock } from "../types/chat.types.ts"

describe("resolveMessageBlocks", () => {
  it("keeps unknown block types so the renderer can ignore them", () => {
    const blocks = [
      { type: "markdown", content: "Hola" },
      { type: "future_block", payload: { id: "x" } },
    ] as unknown as ChatBlock[]

    const resolved = resolveMessageBlocks("Hola", blocks)

    assert.equal(resolved.length, 2)
    assert.equal(resolved[1].type, "future_block")
  })

  it("prefers the richer markdown content", () => {
    const resolved = resolveMessageBlocks("corto", [
      { type: "markdown", content: "una respuesta mucho más larga" },
    ])

    assert.equal(resolved[0].type, "markdown")
    assert.equal(resolved[0].content, "una respuesta mucho más larga")
  })

  it("falls back to actions when there are no blocks", () => {
    const resolved = resolveMessageBlocks("Listo", undefined, [
      {
        id: "action-1",
        actionType: "create_transaction",
        targetModule: "finance",
        payload: {},
        status: "PENDING",
      },
    ])

    assert.equal(resolved.length, 2)
    assert.equal(resolved[1].type, "action")
  })
})
