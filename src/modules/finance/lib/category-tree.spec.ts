import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  groupCategoriesByParent,
  isFinanceCategoryEditable,
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
      ["groc"],
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
