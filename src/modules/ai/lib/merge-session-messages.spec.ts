import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { mergeSessionMessages } from "./merge-session-messages.ts"
import type { AiSessionMessage } from "../types/chat.types.ts"

function sessionMessage(
  overrides: Partial<AiSessionMessage> & { id: string }
): AiSessionMessage {
  return {
    role: "assistant",
    content: "",
    metadata: {},
    createdAt: "2026-10-14T10:00:00.000Z",
    ...overrides,
  }
}

describe("mergeSessionMessages", () => {
  it("keeps an assistant answer that is only a block", () => {
    const serverMessages = [
      sessionMessage({
        id: "m1",
        content: "",
        metadata: {
          blocks: [
            { type: "markdown", content: "" },
            {
              type: "budget_progress",
              budgetId: "budget-1",
              spent: "300",
              limit: "1000",
              currency: "DOP",
            },
          ],
        },
      }),
    ]

    const merged = mergeSessionMessages([], serverMessages)

    assert.equal(merged.length, 1)
    assert.equal(merged[0].role, "assistant")
    assert.equal(merged[0].blocks?.length, 2)
  })

  it("drops an empty assistant answer without blocks", () => {
    const merged = mergeSessionMessages(
      [],
      [sessionMessage({ id: "m1", content: "   " })]
    )

    assert.equal(merged.length, 0)
  })

  it("drops the internal tool request message", () => {
    const merged = mergeSessionMessages(
      [],
      [
        sessionMessage({
          id: "m1",
          content: "[tool_calls]",
          metadata: { phase: "tool_request" },
        }),
      ]
    )

    assert.equal(merged.length, 0)
  })

  it("keeps regular user and assistant messages", () => {
    const merged = mergeSessionMessages(
      [],
      [
        sessionMessage({ id: "m1", role: "user", content: "Hola" }),
        sessionMessage({ id: "m2", content: "Hola, ¿en qué te ayudo?" }),
      ]
    )

    assert.equal(merged.length, 2)
    assert.deepEqual(
      merged.map((message) => message.role),
      ["user", "assistant"]
    )
  })

  it("prefers the persisted blocks over the local ones", () => {
    const local = [
      {
        id: "local-1",
        clientMessageId: "client-1",
        role: "assistant" as const,
        content: "respuesta",
        blocks: [{ type: "markdown" as const, content: "respuesta" }],
      },
    ]
    const serverMessages = [
      sessionMessage({
        id: "server-1",
        clientMessageId: "client-1",
        content: "respuesta",
        metadata: {
          blocks: [
            { type: "markdown", content: "respuesta" },
            {
              type: "transaction_card",
              transactionId: "tx-1",
              snapshot: {
                id: "tx-1",
                type: "DEBIT",
                amount: "250",
                currency: "DOP",
                transactionDate: "2026-10-14T10:00:00.000Z",
                merchant: "Café",
                description: null,
                accountName: "Popular",
                cardName: null,
                status: "CONFIRMED",
              },
            },
          ],
        },
      }),
    ]

    const merged = mergeSessionMessages(local, serverMessages)

    assert.equal(merged.length, 1)
    assert.equal(merged[0].blocks?.length, 2)
  })
})
