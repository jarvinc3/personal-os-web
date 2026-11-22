import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { AgentChatOverlaySkeleton } from "./agent-chat-overlay-skeleton.tsx"

function renderSkeleton() {
  return renderToStaticMarkup(createElement(AgentChatOverlaySkeleton))
}

describe("AgentChatOverlaySkeleton", () => {
  it("pinta la hoja como diálogo con su estado de carga", () => {
    const html = renderSkeleton()

    assert.match(html, /role="dialog"/)
    assert.match(html, /aria-modal="true"/)
    assert.match(html, /aria-busy="true"/)
    assert.match(html, /aria-label="Chat con el agente"/)
    assert.match(html, /role="status"/)
    assert.match(html, /Cargando el chat\./)
  })

  it("ocupa la misma estructura que el overlay con bloques de esqueleto", () => {
    const html = renderSkeleton()
    const skeletonCount = html.match(/data-slot="skeleton"/g)?.length ?? 0

    assert.ok(skeletonCount >= 5)
    assert.match(html, /data-slot="agent-chat-skeleton"/)
    assert.doesNotMatch(html, /Pregunta sobre lo que estás viendo/)
  })
})
