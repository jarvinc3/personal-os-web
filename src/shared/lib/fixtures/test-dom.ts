import { JSDOM, type DOMWindow } from "jsdom"
import { act, type ReactNode } from "react"

const UI_TIMEOUT_MS = 5_000
const POLL_INTERVAL_MS = 20

type PressKeyInput = {
  key: string
  ctrlKey?: boolean
}

type TestDom = {
  container: HTMLElement
  render: (element: ReactNode) => Promise<void>
  pressKey: (input: PressKeyInput) => Promise<void>
  waitForScreen: (assertion: () => void) => Promise<void>
  cleanup: () => Promise<void>
}

/**
 * Instala un DOM de jsdom para pruebas que simulan interacción. node:test aísla
 * cada archivo en su proceso, así que los globales no se fugan a otras pruebas.
 * React DOM se importa después del DOM: decide al cargar si hay navegador.
 */
export async function installTestDom(): Promise<TestDom> {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost:3000/",
    // Sin este modo jsdom no define requestAnimationFrame.
    pretendToBeVisual: true,
  })
  const { window } = dom

  installBrowserGlobals(window)
  // jsdom no implementa scroll ni matchMedia; la app los usa al montar.
  window.Element.prototype.scrollIntoView = () => {}
  window.matchMedia = createMediaQueryList

  const container = window.document.createElement("div")
  window.document.body.appendChild(container)
  const { createRoot } = await import("react-dom/client")
  const root = createRoot(container)

  const render = async (element: ReactNode) => {
    await act(async () => {
      root.render(element)
    })
  }

  const pressKey = async ({ key, ctrlKey = false }: PressKeyInput) => {
    await act(async () => {
      window.dispatchEvent(
        new window.KeyboardEvent("keydown", { key, ctrlKey, bubbles: true })
      )
    })
  }

  const waitForScreen = async (assertion: () => void) => {
    const deadline = Date.now() + UI_TIMEOUT_MS
    let lastFailure: unknown

    while (Date.now() < deadline) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
      })
      try {
        assertion()
        return
      } catch (error) {
        lastFailure = error
      }
    }

    throw lastFailure ?? new Error("La pantalla no apareció a tiempo")
  }

  const cleanup = async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    window.close()
  }

  return { container, render, pressKey, waitForScreen, cleanup }
}

function installBrowserGlobals(window: DOMWindow): void {
  const globalValues = {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    Element: window.Element,
    Node: window.Node,
    Event: window.Event,
    KeyboardEvent: window.KeyboardEvent,
    MouseEvent: window.MouseEvent,
    getComputedStyle: window.getComputedStyle.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  }

  for (const [key, value] of Object.entries(globalValues)) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    })
  }
  Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
    configurable: true,
    writable: true,
    value: true,
  })
}

function createMediaQueryList(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }
}
