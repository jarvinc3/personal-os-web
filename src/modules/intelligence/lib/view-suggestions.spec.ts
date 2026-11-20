import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildViewSuggestionScope,
  hideViewSuggestions,
  isViewSuggestionsHidden,
  viewSuggestionQueryString,
  viewSuggestionScopeFromContext,
  viewSuggestionScopeKey,
} from "./view-suggestions.ts"

function params(query = "") {
  return new URLSearchParams(query)
}

describe("buildViewSuggestionScope", () => {
  it("uses the route and the tab as the view, without filters", () => {
    const scope = buildViewSuggestionScope({
      pathname: "/finance/transactions",
      searchParams: params("tab=pending&month=2026-11&sheet=other-sheet"),
    })

    assert.deepEqual(scope, {
      route: "/finance/transactions",
      view: "pending",
    })
  })

  it("uses the open sheet only when requested", () => {
    const scope = buildViewSuggestionScope({
      pathname: "/finance/planning",
      searchParams: params("sheet=budget-sheet&sheetId=b-1"),
      includeSheet: true,
    })

    assert.deepEqual(scope, {
      route: "/finance/planning",
      sheet: "budget-sheet",
    })
  })

  it("ignores the overlay sheet and prefers the view", () => {
    const scope = buildViewSuggestionScope({
      pathname: "/intelligence",
      searchParams: params("sheet=agent-chat&tab=messages"),
      includeSheet: true,
    })

    assert.deepEqual(scope, {
      route: "/intelligence",
      view: "messages",
    })
  })
})

describe("viewSuggestionScopeFromContext", () => {
  it("keeps sheet before view and ignores entity and filters", () => {
    assert.deepEqual(
      viewSuggestionScopeFromContext({
        route: "/finance/transactions",
        sheet: "transaction-options-sheet",
        view: "pending",
        entityRef: {
          type: "transaction",
          id: "00000000-0000-4000-8000-000000000001",
        },
        filters: { month: "2026-11" },
      }),
      { route: "/finance/transactions", sheet: "transaction-options-sheet" }
    )
    assert.deepEqual(
      viewSuggestionScopeFromContext({
        route: "/finance/planning",
        view: "budgets",
      }),
      { route: "/finance/planning", view: "budgets" }
    )
  })
})

describe("viewSuggestionQueryString", () => {
  it("sends route plus view or sheet, never both", () => {
    assert.equal(
      viewSuggestionQueryString({
        route: "/finance/transactions",
        view: "pending",
      }),
      "route=%2Ffinance%2Ftransactions&view=pending"
    )
    assert.equal(
      viewSuggestionQueryString({
        route: "/finance/transactions",
        sheet: "transaction-options-sheet",
      }),
      "route=%2Ffinance%2Ftransactions&sheet=transaction-options-sheet"
    )
  })
})

describe("session hide", () => {
  const scope = { route: "/finance/transactions", view: "pending" }
  const otherScope = { route: "/finance/planning" }

  function memoryStorage() {
    const values = new Map<string, string>()
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    }
  }

  it("hides only the requested scope for the session", () => {
    const storage = memoryStorage()

    assert.equal(isViewSuggestionsHidden(scope, storage), false)
    hideViewSuggestions(scope, storage)
    assert.equal(isViewSuggestionsHidden(scope, storage), true)
    assert.equal(isViewSuggestionsHidden(otherScope, storage), false)
  })

  it("builds a stable key per route, view and sheet", () => {
    assert.equal(
      viewSuggestionScopeKey(scope),
      viewSuggestionScopeKey({ route: scope.route, view: scope.view })
    )
    assert.notEqual(
      viewSuggestionScopeKey(scope),
      viewSuggestionScopeKey(otherScope)
    )
  })
})
