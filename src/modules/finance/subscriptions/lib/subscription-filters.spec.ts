import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  EMPTY_SUBSCRIPTION_FILTERS,
  activeSubscriptionFilterCount,
  clearSubscriptionFilter,
  subscriptionFilterChips,
  subscriptionFiltersFromSearchParams,
  subscriptionFiltersToSearchParams,
  subscriptionListQuery,
  subscriptionMethodLabel,
  withSubscriptionFilters,
  type SubscriptionFilters,
} from "./subscription-filters.ts"

function filters(
  overrides: Partial<SubscriptionFilters> = {}
): SubscriptionFilters {
  return { ...EMPTY_SUBSCRIPTION_FILTERS, ...overrides }
}

const params = (query: string) => new URLSearchParams(query)

describe("activeSubscriptionFilterCount", () => {
  it("counts every filter that is on", () => {
    assert.equal(activeSubscriptionFilterCount(filters()), 0)
    assert.equal(
      activeSubscriptionFilterCount(
        filters({ status: "ACTIVE", method: "card:card-1" })
      ),
      2
    )
    assert.equal(
      activeSubscriptionFilterCount(
        filters({ frequency: "YEARLY", categoryIds: ["cat-1", "cat-2"] })
      ),
      3
    )
  })

  it("ignores the search text, which has its own control", () => {
    assert.equal(activeSubscriptionFilterCount(filters({ q: "netflix" })), 0)
  })
})

describe("subscriptionFilterChips", () => {
  it("labels each chip with the value it filters", () => {
    const chips = subscriptionFilterChips({
      filters: filters({
        status: "ACTIVE",
        frequency: "YEARLY",
        method: "card:card-1",
        categoryIds: ["cat-1"],
      }),
      methodLabel: "BHD Visa ••4821",
      categoryLabels: { "cat-1": "Streaming" },
    })
    assert.deepEqual(
      chips.map((chip) => chip.label),
      ["Activas", "Anual", "BHD Visa ••4821", "Streaming"]
    )
  })

  it("falls back when the method or the category has no name yet", () => {
    const chips = subscriptionFilterChips({
      filters: filters({ method: "card:missing", categoryIds: ["cat-x"] }),
      methodLabel: null,
      categoryLabels: {},
    })
    assert.deepEqual(
      chips.map((chip) => chip.label),
      ["Método de pago", "Categoría"]
    )
  })
})

describe("clearSubscriptionFilter", () => {
  it("clears only the dismissed chip", () => {
    const current = filters({
      status: "PAUSED",
      categoryIds: ["cat-1", "cat-2"],
    })
    const cleared = clearSubscriptionFilter(current, {
      key: "category",
      label: "Streaming",
      categoryId: "cat-1",
    })
    assert.deepEqual(cleared.categoryIds, ["cat-2"])
    assert.equal(cleared.status, "PAUSED")
  })

  it("resets a segmented filter to Todas", () => {
    assert.equal(
      clearSubscriptionFilter(filters({ frequency: "OTHER" }), {
        key: "frequency",
        label: "Otra",
      }).frequency,
      "ALL"
    )
    assert.equal(
      clearSubscriptionFilter(filters({ method: "card:card-1" }), {
        key: "method",
        label: "Visa",
      }).method,
      null
    )
  })
})

describe("subscriptionMethodLabel", () => {
  it("names the card with its last digits and the account by name", () => {
    const accounts = [{ id: "acc-1", name: "Ahorros Popular" }]
    const cards = [{ id: "card-1", name: "BHD Visa", lastFour: "4821" }]

    assert.equal(
      subscriptionMethodLabel({ method: "card:card-1", accounts, cards }),
      "BHD Visa ••4821"
    )
    assert.equal(
      subscriptionMethodLabel({ method: "account:acc-1", accounts, cards }),
      "Ahorros Popular"
    )
  })

  it("stays null without a method or with one that is not loaded", () => {
    assert.equal(
      subscriptionMethodLabel({ method: null, accounts: [], cards: [] }),
      null
    )
    assert.equal(
      subscriptionMethodLabel({ method: "card:gone", accounts: [], cards: [] }),
      null
    )
  })
})

describe("subscriptionListQuery", () => {
  it("drops the filters that are off", () => {
    assert.deepEqual(subscriptionListQuery(filters()), {
      status: undefined,
      frequency: undefined,
      sort: "NEXT_DATE",
      categoryIds: undefined,
      cardId: undefined,
      accountId: undefined,
      q: undefined,
    })
  })

  it("sends the categories as one list and splits the method target", () => {
    const query = subscriptionListQuery(
      filters({
        status: "ACTIVE",
        frequency: "MONTHLY",
        sort: "AMOUNT",
        categoryIds: ["cat-1", "cat-2"],
        method: "account:acc-1",
        q: "  netflix ",
      })
    )
    assert.equal(query.categoryIds, "cat-1,cat-2")
    assert.equal(query.accountId, "acc-1")
    assert.equal(query.cardId, undefined)
    assert.equal(query.frequency, "MONTHLY")
    assert.equal(query.sort, "AMOUNT")
    assert.equal(query.q, "netflix")
  })
})

describe("filter search params", () => {
  it("round-trips every filter through the URL", () => {
    const current = filters({
      status: "PAUSED",
      frequency: "OTHER",
      sort: "NAME",
      categoryIds: ["cat-1", "cat-2"],
      method: "card:card-1",
      q: "spotify",
    })
    const restored = subscriptionFiltersFromSearchParams(
      params(subscriptionFiltersToSearchParams(current))
    )
    assert.deepEqual(restored, current)
  })

  it("keeps the default view out of the URL", () => {
    assert.equal(subscriptionFiltersToSearchParams(filters()), "")
  })

  it("falls back to the defaults when a param is unknown", () => {
    const restored = subscriptionFiltersFromSearchParams(
      params("estado=NOPE&frecuencia=DAILY&orden=PRICE")
    )
    assert.equal(restored.status, "ALL")
    assert.equal(restored.frequency, "ALL")
    assert.equal(restored.sort, "NEXT_DATE")
  })

  it("keeps the rest of the query when the filters change", () => {
    const next = withSubscriptionFilters(
      "sheet=subscription-filters-sheet&tab=price&estado=PAUSED",
      filters({ status: "ACTIVE", q: "net" })
    )
    const merged = params(next)
    assert.equal(merged.get("sheet"), "subscription-filters-sheet")
    assert.equal(merged.get("tab"), "price")
    assert.equal(merged.get("estado"), "ACTIVE")
    assert.equal(merged.get("q"), "net")
  })
})
