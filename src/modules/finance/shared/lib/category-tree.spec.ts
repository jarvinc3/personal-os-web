import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  applyLocalCategoryOrder,
  filterCategoriesByType,
  groupCategoriesByParent,
  isFinanceCategoryEditable,
  searchCategoryGroups,
  sortCategoriesNewestFirst,
} from "./category-tree.ts"

describe("groupCategoriesByParent", () => {
  it("groups a flat list by parentId without needing a nested payload", () => {
    const food = { id: "food", parentId: null, name: "Comida" }
    const groceries = { id: "groc", parentId: "food", name: "Supermercado" }
    const rent = { id: "rent", parentId: null, name: "Alquiler" }
    const grouped = groupCategoriesByParent([food, groceries, rent])

    assert.equal(grouped.length, 2)
    assert.equal(grouped[0]?.category.id, "food")
    assert.deepEqual(
      grouped[0]?.children.map((item) => item.id),
      ["groc"]
    )
    assert.equal(grouped[1]?.category.id, "rent")
    assert.deepEqual(grouped[1]?.children, [])
  })

  it("treats unknown parentId as a root instead of dropping the row", () => {
    const orphan = { id: "orphan", parentId: "missing", name: "Huérfana" }
    const grouped = groupCategoriesByParent([orphan])
    assert.equal(grouped.length, 1)
    assert.equal(grouped[0]?.category.id, "orphan")
    assert.deepEqual(grouped[0]?.children, [])
  })
})

describe("isFinanceCategoryEditable", () => {
  it("allows custom categories and blocks system ones", () => {
    assert.equal(isFinanceCategoryEditable({ isSystem: false }), true)
    assert.equal(isFinanceCategoryEditable({ isSystem: true }), false)
  })
})

describe("sortCategoriesNewestFirst", () => {
  it("puts the latest createdAt first", () => {
    const sorted = sortCategoriesNewestFirst([
      { id: "old", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "new", createdAt: "2026-03-01T00:00:00.000Z" },
      { id: "mid", createdAt: "2026-02-01T00:00:00.000Z" },
    ])
    assert.deepEqual(
      sorted.map((item) => item.id),
      ["new", "mid", "old"]
    )
  })
})

describe("applyLocalCategoryOrder", () => {
  it("keeps the saved order and prepends ids that are not in it", () => {
    const items = [{ id: "fresh" }, { id: "b" }, { id: "a" }]
    const ordered = applyLocalCategoryOrder(items, ["a", "b", "gone"])
    assert.deepEqual(
      ordered.map((item) => item.id),
      ["fresh", "a", "b"]
    )
  })
})

describe("searchCategoryGroups", () => {
  const food = { id: "food", parentId: null, name: "Alimentación" }
  const groceries = { id: "groc", parentId: "food", name: "Supermercado" }
  const rent = { id: "rent", parentId: null, name: "Hogar" }
  const groups = groupCategoriesByParent([food, groceries, rent])

  it("keeps every group collapsed when the query is empty", () => {
    const hits = searchCategoryGroups(groups, "  ")
    assert.equal(hits.length, 2)
    assert.equal(
      hits.every((hit) => hit.open === false),
      true
    )
    assert.deepEqual(
      hits[0]?.children.map((item) => item.id),
      ["groc"]
    )
  })

  it("keeps a parent-only hit collapsed", () => {
    const [hit] = searchCategoryGroups(groups, "hogar")
    assert.equal(hit?.category.id, "rent")
    assert.equal(hit?.parentMatches, true)
    assert.equal(hit?.open, false)
  })

  it("opens the parent when a child matches and drops the rest", () => {
    const hits = searchCategoryGroups(groups, "super")
    assert.equal(hits.length, 1)
    assert.equal(hits[0]?.category.id, "food")
    assert.equal(hits[0]?.open, true)
    assert.equal(hits[0]?.parentMatches, false)
    assert.deepEqual(
      hits[0]?.matchingChildren.map((item) => item.id),
      ["groc"]
    )
  })

  it("matches names without accents", () => {
    const hits = searchCategoryGroups(groups, "alimentacion")
    assert.equal(hits[0]?.category.id, "food")
    assert.equal(hits[0]?.parentMatches, true)
    assert.equal(hits[0]?.open, false)
  })
})

describe("filterCategoriesByType", () => {
  it("keeps only categories of the requested type", () => {
    const items = [
      { id: "food", type: "EXPENSE" },
      { id: "salary", type: "INCOME" },
      { id: "rent", type: "EXPENSE" },
    ]
    assert.deepEqual(
      filterCategoriesByType(items, "INCOME").map((item) => item.id),
      ["salary"]
    )
    assert.deepEqual(
      filterCategoriesByType(items, "EXPENSE").map((item) => item.id),
      ["food", "rent"]
    )
  })
})
