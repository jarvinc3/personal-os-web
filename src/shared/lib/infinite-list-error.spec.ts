import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { resolveInfiniteListErrorState } from "@/src/shared/lib/infinite-list-error"

type Page = { items: readonly string[] }

/** Lo que deja TanStack Query 5 tras fallar `fetchNextPage` con una tanda ya cargada. */
function infiniteListState({
  pages,
  isError,
}: {
  pages: Page[]
  isError: boolean
}) {
  const loadedRows = pages.flatMap((page) => page.items)

  return {
    loadedRows,
    errorState: resolveInfiniteListErrorState({
      hasError: isError,
      itemCount: loadedRows.length,
    }),
  }
}

describe("estado de error de una lista infinita", () => {
  it("no muestra error mientras todo va bien", () => {
    assert.equal(
      resolveInfiniteListErrorState({ hasError: false, itemCount: 3 }),
      "none"
    )
  })

  it("conserva las filas cuando falla la siguiente tanda", () => {
    const state = infiniteListState({
      pages: [{ items: ["primera"] }],
      isError: true,
    })

    assert.deepEqual(state.loadedRows, ["primera"])
    assert.equal(state.errorState, "inline")
  })

  it("conserva las filas cuando falla un refresco en segundo plano", () => {
    const state = infiniteListState({
      pages: [{ items: ["primera", "segunda"] }],
      isError: true,
    })

    assert.equal(state.loadedRows.length, 2)
    assert.equal(state.errorState, "inline")
  })

  it("muestra el error completo cuando no hay filas cargadas", () => {
    const state = infiniteListState({ pages: [], isError: true })

    assert.deepEqual(state.loadedRows, [])
    assert.equal(state.errorState, "full")
  })
})
