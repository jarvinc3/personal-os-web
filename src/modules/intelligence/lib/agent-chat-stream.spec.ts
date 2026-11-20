import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  readAgentStream,
  readSseData,
  splitSseBlocks,
} from "./agent-chat-stream.ts"
import type { AgentStreamEvent } from "../types/agent-chat.types.ts"

function streamFrom(chunks: readonly string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
      }
      controller.close()
    },
  })
}

const done = {
  type: "done",
  conversationId: "c-1",
  answer: "Gastaste RD$1,250.",
  provider: "Groq",
  model: "model-1",
  actions: [],
} as const

describe("SSE helpers", () => {
  it("keeps an incomplete block for the next chunk", () => {
    assert.deepEqual(
      splitSseBlocks('event: chunk\ndata: {"type":"chunk"}\n\nevent: chu'),
      {
        blocks: ['event: chunk\ndata: {"type":"chunk"}'],
        rest: "event: chu",
      }
    )
  })

  it("normalizes CRLF and joins multiple data lines", () => {
    const { blocks } = splitSseBlocks(
      'event: chunk\r\ndata: {"type":\r\ndata: "chunk"}\r\n\r\n'
    )
    assert.equal(readSseData(blocks[0]), '{"type":\n"chunk"}')
  })
})

describe("readAgentStream", () => {
  it("reads events split across chunks and returns the done answer", async () => {
    const events: AgentStreamEvent[] = []
    const answer = await readAgentStream({
      body: streamFrom([
        'event: start\ndata: {"type":"start","conversationId":"c-1"}\n\n',
        'event: chunk\ndata: {"type":"chunk","content":"Hola"}\n',
        "\nevent: done\ndata: ",
        JSON.stringify(done) + "\n\n",
      ]),
      onEvent: (event) => events.push(event),
    })

    assert.equal(answer.answer, "Gastaste RD$1,250.")
    assert.deepEqual(
      events.map((event) => event.type),
      ["start", "chunk", "done"]
    )
  })

  it("throws the error event message", async () => {
    await assert.rejects(
      readAgentStream({
        body: streamFrom([
          'event: error\ndata: {"type":"error","message":"Falló el modelo"}\n\n',
        ]),
        onEvent: () => undefined,
      }),
      /Falló el modelo/
    )
  })

  it("fails when the stream ends without done", async () => {
    await assert.rejects(
      readAgentStream({
        body: streamFrom([
          'event: chunk\ndata: {"type":"chunk","content":"Hola"}\n\n',
        ]),
        onEvent: () => undefined,
      }),
      /sin completarse/
    )
  })
})
