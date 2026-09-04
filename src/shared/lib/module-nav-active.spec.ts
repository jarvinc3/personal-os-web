import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  isModuleSectionActive,
  moduleHasSections,
} from "./module-nav-active.ts"

const resumen = { href: "/finance", matchExact: true as const }
const cuentas = {
  href: "/finance/accounts",
  extraActiveHrefs: ["/finance/sync", "/finance/sync/oauth"],
}

describe("isModuleSectionActive", () => {
  it("marks Cuentas active on /finance/accounts", () => {
    assert.equal(isModuleSectionActive(cuentas, "/finance/accounts"), true)
  })

  it("marks Cuentas active on /finance/sync", () => {
    assert.equal(isModuleSectionActive(cuentas, "/finance/sync"), true)
  })

  it("marks Cuentas active on /finance/sync/oauth", () => {
    assert.equal(isModuleSectionActive(cuentas, "/finance/sync/oauth"), true)
  })

  it("does not mark Cuentas on sibling finance routes", () => {
    assert.equal(isModuleSectionActive(cuentas, "/finance"), false)
    assert.equal(isModuleSectionActive(cuentas, "/finance/transactions"), false)
  })

  it("marks Resumen exact and not on child routes", () => {
    assert.equal(isModuleSectionActive(resumen, "/finance"), true)
    assert.equal(isModuleSectionActive(resumen, "/finance/accounts"), false)
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
