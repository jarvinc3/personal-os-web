import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { appModules } from "./modules-data.ts"

describe("appModules finance status", () => {
  it("does not use in_design; uses coming_soon until P1 closes", () => {
    const finance = appModules.find((module) => module.id === "finance")
    assert.ok(finance)
    assert.notEqual(finance.status, "in_design")
    assert.equal(finance.status, "coming_soon")
  })
})
