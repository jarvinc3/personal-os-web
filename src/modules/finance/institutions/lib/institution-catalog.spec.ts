import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { filterCatalog, POPULAR_INSTITUTIONS } from "./institution-catalog.ts"

describe("filterCatalog", () => {
  it("filtra por el tipo elegido y conserva el orden del catálogo", () => {
    const banks = filterCatalog(POPULAR_INSTITUTIONS, "bank")

    assert.ok(banks.length > 0)
    assert.ok(banks.every((entry) => entry.type === "bank"))
    assert.equal(banks[0].name, "Banreservas")
    assert.equal(banks.at(-1)?.name, "Banco Santa Cruz")
  })

  it("separa las billeteras digitales", () => {
    const wallets = filterCatalog(POPULAR_INSTITUTIONS, "digital_wallet")

    assert.deepEqual(
      wallets.map((entry) => entry.name),
      ["Qik"]
    )
  })

  it("sin coincidencias devuelve una lista vacía", () => {
    assert.deepEqual(filterCatalog(POPULAR_INSTITUTIONS, "credit_union"), [])
    assert.deepEqual(filterCatalog([], "bank"), [])
  })

  it("no muta la lista original", () => {
    const before = POPULAR_INSTITUTIONS.length

    filterCatalog(POPULAR_INSTITUTIONS, "bank")

    assert.equal(POPULAR_INSTITUTIONS.length, before)
  })

  it("cada entrada trae nombre, dominio y color", () => {
    for (const entry of POPULAR_INSTITUTIONS) {
      assert.ok(entry.name.length > 0)
      assert.ok(entry.domain.includes("."))
      assert.match(entry.color, /^#[0-9A-Fa-f]{6}$/)
    }
  })
})
