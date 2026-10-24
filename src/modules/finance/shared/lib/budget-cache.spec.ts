import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { budgetFromListPages } from "./budget-cache.ts"
import type { FinancePaginated } from "../types/api.ts"
import type { FinanceBudget } from "../types/entities.ts"

function budget(id: string): FinanceBudget {
  return { id } as FinanceBudget
}

function page(...ids: string[]): FinancePaginated<FinanceBudget> {
  return {
    items: ids.map(budget),
    nextCursor: null,
    hasMore: false,
  }
}

describe("budgetFromListPages", () => {
  it("finds a budget on a later page", () => {
    const pages = [page("b-1", "b-2"), page("b-3")]

    assert.equal(budgetFromListPages(pages, "b-3")?.id, "b-3")
  })

  it("returns nothing when no page carries the budget", () => {
    assert.equal(budgetFromListPages([page("b-1")], "b-9"), undefined)
  })

  it("returns nothing without pages", () => {
    assert.equal(budgetFromListPages([], "b-1"), undefined)
  })
})
