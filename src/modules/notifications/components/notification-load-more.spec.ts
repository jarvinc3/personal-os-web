import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { NotificationLoadMore } from "@/src/modules/notifications/components/notification-load-more"

function renderLoadMore(
  props: Partial<Parameters<typeof NotificationLoadMore>[0]> = {}
): string {
  return renderToStaticMarkup(
    createElement(NotificationLoadMore, {
      hasNextPage: true,
      isFetchingNextPage: false,
      hasError: false,
      onLoadMore: () => {},
      ...props,
    })
  )
}

describe("NotificationLoadMore", () => {
  it("pinta el centinela con su botón accesible mientras hay más", () => {
    const html = renderLoadMore()

    assert.match(html, /Cargar más/)
    assert.match(html, /<button[^>]*type="button"/)
  })

  it("no pinta nada cuando no hay más páginas", () => {
    assert.equal(renderLoadMore({ hasNextPage: false }), "")
  })

  it("indica que está cargando", () => {
    const html = renderLoadMore({ isFetchingNextPage: true })

    assert.match(html, /Cargando/)
    assert.match(html, /disabled/)
  })

  it("ante un error deja reintentar y conserva lo cargado", () => {
    const html = renderLoadMore({ hasError: true })

    assert.match(html, /No se pudieron cargar más notificaciones/)
    assert.match(html, /La lista conserva los avisos/)
    assert.match(html, /Reintentar/)
    assert.doesNotMatch(html, /Cargar más/)
  })

  it("deshabilita el reintento mientras carga la siguiente tanda", () => {
    const html = renderLoadMore({ hasError: true, isFetchingNextPage: true })

    assert.match(html, /disabled/)
  })
})
