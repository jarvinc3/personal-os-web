import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { UsageStateView } from "@/src/modules/settings/components/usage/usage-state-view"

function renderUsageState(props: Parameters<typeof UsageStateView>[0]) {
  return renderToStaticMarkup(createElement(UsageStateView, props))
}

describe("estados de Uso", () => {
  it("pinta el esqueleto de carga", () => {
    const html = renderUsageState({ state: "loading" })

    assert.match(html, /data-slot="skeleton"/)
    assert.doesNotMatch(html, /No se pudo cargar el uso/)
    assert.doesNotMatch(html, /Sin clasificaciones/)
  })

  it("pinta el error con el botón de reintento", () => {
    const html = renderUsageState({
      state: "error",
      onRetry: () => {},
    })

    assert.match(html, /No se pudo cargar el uso de clasificación\./)
    assert.match(html, /Reintentar/)
    assert.match(html, /<button[^>]*type="button"/)
  })

  it("deshabilita el reintento mientras se reintenta", () => {
    const html = renderUsageState({
      state: "error",
      onRetry: () => {},
      isRetrying: true,
    })

    assert.match(html, /disabled=""/)
  })

  it("pinta el vacío con su explicación", () => {
    const html = renderUsageState({ state: "empty" })

    assert.match(html, /Sin clasificaciones en este rango/)
    assert.match(html, /No hay llamadas de clasificación registradas/)
  })
})
