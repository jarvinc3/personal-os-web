import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { appModules } from "./modules-data.ts"

describe("appModules finance status", () => {
  it("is available after P1 children closed", () => {
    const finance = appModules.find((module) => module.id === "finance")
    assert.ok(finance)
    assert.notEqual(finance.status, "in_design")
    assert.notEqual(finance.status, "coming_soon")
    assert.equal(finance.status, "available")
  })
})
