import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { CATALOG_NONE } from "../constants/catalog.ts"
import {
  removeCategoryId,
  toggleCategorySelection,
} from "./category-selection.ts"

describe("toggleCategorySelection", () => {
  it("adds a category that is not selected", () => {
    assert.deepEqual(toggleCategorySelection(["food"], "rent"), [
      "food",
      "rent",
    ])
  })

  it("removes a category that is already selected", () => {
    assert.deepEqual(toggleCategorySelection(["food", "rent"], "food"), [
      "rent",
    ])
  })

  it("clears the whole selection when CATALOG_NONE is picked", () => {
    assert.deepEqual(
      toggleCategorySelection(["food", "rent"], CATALOG_NONE),
      []
    )
  })

  it("returns a new array and keeps the input untouched", () => {
    const selected = ["food"]
    const next = toggleCategorySelection(selected, "rent")
    assert.deepEqual(selected, ["food"])
    assert.notEqual(next, selected)
  })

  it("keeps the order of the remaining ids when removing", () => {
    assert.deepEqual(toggleCategorySelection(["a", "b", "c"], "b"), ["a", "c"])
  })
})

describe("removeCategoryId", () => {
  it("drops only the given id", () => {
    assert.deepEqual(removeCategoryId(["a", "b", "c"], "b"), ["a", "c"])
  })

  it("leaves an unknown id out of the result", () => {
    assert.deepEqual(removeCategoryId(["a"], "missing"), ["a"])
  })
})
