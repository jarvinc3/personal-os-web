import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { AgentChatMarkdown } from "@/src/modules/intelligence/components/agent-chat-markdown"

function renderMarkdown(content: string): string {
  return renderToStaticMarkup(createElement(AgentChatMarkdown, { content }))
}

describe("AgentChatMarkdown", () => {
  it("no crea un enlace con un esquema de script", () => {
    const html = renderMarkdown("[abrir](javascript:alert%281%29)")

    assert.doesNotMatch(html, /<a\b/)
    assert.match(html, /abrir/)
  })

  it("no crea un enlace con una URL de datos", () => {
    const html = renderMarkdown("[abrir](data:text/html,%3Ch1%3Ex%3C/h1%3E)")

    assert.doesNotMatch(html, /<a\b/)
    assert.match(html, /abrir/)
  })

  it("abre un enlace https fuera de la app y sin referente", () => {
    const html = renderMarkdown("[ver](https://ejemplo.test/x)")

    assert.match(html, /<a\b[^>]*href="https:\/\/ejemplo\.test\/x"/)
    assert.match(html, /target="_blank"/)
    assert.match(html, /rel="noreferrer"/)
  })

  it("pinta mailto como enlace sin abrir otra pestaña", () => {
    const html = renderMarkdown("[escribir](mailto:alguien@ejemplo.test)")

    assert.match(html, /href="mailto:alguien@ejemplo\.test"/)
    assert.doesNotMatch(html, /target=/)
  })
})
