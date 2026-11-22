import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createElement } from "react"

import { AGENT_CHAT_SHEET_KEY } from "@/src/modules/intelligence/constants/agent-chat"
import { AgentChatLauncherProvider } from "@/src/shared/components/agent-chat/agent-chat-launcher"
import { TabBarVisibilityProvider } from "@/src/shared/context/tab-bar-context"
import { installTestDom } from "@/src/shared/lib/fixtures/test-dom"
import { TestNextRouter } from "@/src/shared/lib/fixtures/test-next-router"
import { SHEET_QUERY_KEY } from "@/src/shared/lib/sheet-navigation"

type AgentChatHostComponent =
  (typeof import("@/src/modules/intelligence/components/agent-chat-host"))["AgentChatHost"]

let dom: Awaited<ReturnType<typeof installTestDom>>
let AgentChatHost: AgentChatHostComponent
let originalFetch: typeof fetch

before(async () => {
  dom = await installTestDom()
  originalFetch = globalThis.fetch
  // La prueba no depende de red: las consultas del chat fallan y la hoja se
  // pinta igual.
  globalThis.fetch = async () => {
    throw new Error("red deshabilitada en la prueba")
  }
  // El host importa `next/dynamic`, que decide al cargar si hay navegador.
  ;({ AgentChatHost } =
    await import("@/src/modules/intelligence/components/agent-chat-host"))
})

after(async () => {
  globalThis.fetch = originalFetch
  await dom?.cleanup()
})

function chatDialog() {
  return dom.container.querySelector(
    '[role="dialog"][aria-label="Chat con el agente"]'
  )
}

function renderChatHost(navigations: string[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return dom.render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        TabBarVisibilityProvider,
        null,
        createElement(
          AgentChatLauncherProvider,
          null,
          createElement(
            TestNextRouter,
            { onNavigate: (url: string) => navigations.push(url) },
            createElement(AgentChatHost)
          )
        )
      )
    )
  )
}

describe("AgentChatHost", () => {
  it("abre la hoja del chat con el atajo del usuario", async () => {
    const navigations: string[] = []

    await renderChatHost(navigations)

    assert.equal(chatDialog(), null)

    await dom.pressKey({ key: "k", ctrlKey: true })

    await dom.waitForScreen(() => {
      assert.ok(chatDialog(), "la hoja del chat no aparece")
      assert.ok(
        dom.container.querySelector('[aria-label="Cerrar el chat"]'),
        "el overlay real no montó"
      )
    })

    assert.ok(dom.container.querySelector("textarea"))

    const lastNavigation = navigations.at(-1)
    assert.ok(lastNavigation, "la apertura no navegó")
    assert.equal(
      new URL(lastNavigation, "http://localhost").searchParams.get(
        SHEET_QUERY_KEY
      ),
      AGENT_CHAT_SHEET_KEY
    )
  })
})
