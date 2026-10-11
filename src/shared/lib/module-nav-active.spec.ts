import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  isModuleSectionActive,
  moduleHasSections,
} from "./module-nav-active.ts"

const resumen = { href: "/finance/overview", matchExact: true as const }
const productos = {
  href: "/finance/products",
  extraActiveHrefs: ["/finance/categories", "/finance/sync"],
}

describe("isModuleSectionActive", () => {
  it("marks Productos active on /finance/products", () => {
    assert.equal(isModuleSectionActive(productos, "/finance/products"), true)
  })

  it("marks Productos active on /finance/sync", () => {
    assert.equal(isModuleSectionActive(productos, "/finance/sync"), true)
  })

  it("marks Productos active on /finance/categories", () => {
    assert.equal(isModuleSectionActive(productos, "/finance/categories"), true)
  })

  it("does not mark Productos on sibling finance routes", () => {
    assert.equal(isModuleSectionActive(productos, "/finance"), false)
    assert.equal(
      isModuleSectionActive(productos, "/finance/transactions"),
      false
    )
  })

  it("marks Resumen exact and not on child routes", () => {
    assert.equal(isModuleSectionActive(resumen, "/finance/overview"), true)
    assert.equal(isModuleSectionActive(resumen, "/finance"), false)
    assert.equal(isModuleSectionActive(resumen, "/finance/products"), false)
    assert.equal(isModuleSectionActive(resumen, "/finance/sync"), false)
  })
})

describe("moduleHasSections", () => {
  it("does not invent tabs for a leaf without items", () => {
    assert.equal(moduleHasSections({}), false)
    assert.equal(moduleHasSections({ items: [] }), false)
  })

  it("treats one or more items as module sections", () => {
    assert.equal(moduleHasSections({ items: [{ href: "/finance" }] }), true)
  })
})
