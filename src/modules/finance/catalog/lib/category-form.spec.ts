import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { categorySchema } from "./category-form.ts"

const BURGER_EMOJI = "\u{1F354}"

const validCategory = {
  name: "Comida",
  icon: BURGER_EMOJI,
  color: "",
  parentId: "",
  type: "EXPENSE" as const,
}

describe("categorySchema", () => {
  it("accepts a name, emoji and type", () => {
    assert.equal(categorySchema.safeParse(validCategory).success, true)
  })

  it("rejects an icon that is not a single emoji", () => {
    assert.equal(
      categorySchema.safeParse({ ...validCategory, icon: "abc" }).success,
      false
    )
  })
})
