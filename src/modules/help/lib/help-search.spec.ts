import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  filterHelpTerms,
  findHelpTerm,
  groupHelpTerms,
  hasHelpSearch,
  parseHelpTermParam,
} from "./help-search.ts"
import type { HelpTerm } from "@/src/modules/help/types/help.types"

const TERMS: readonly HelpTerm[] = [
  {
    slug: "patrimonio",
    term: "Patrimonio neto",
    category: "dinero",
    definition: "Lo que tienes menos lo que debes.",
    aliases: ["net worth"],
  },
  {
    slug: "cuota",
    term: "Cuota",
    category: "planificacion",
    definition: "Cada pago programado de un préstamo.",
  },
  {
    slug: "descuadre",
    term: "Descuadre",
    category: "dinero",
    definition: "El saldo guardado no coincide con la suma de movimientos.",
    aliases: ["descuadrado"],
  },
]

const CATEGORIES = [
  { id: "dinero" as const, label: "Dinero" },
  { id: "planificacion" as const, label: "Planificación" },
  { id: "correo" as const, label: "Correo" },
]

describe("filterHelpTerms", () => {
  it("returns every term for an empty query", () => {
    assert.deepEqual(filterHelpTerms(TERMS, "   "), TERMS)
  })

  it("ignores case and accents in the term", () => {
    assert.deepEqual(
      filterHelpTerms(TERMS, "PATRIMONIO").map((term) => term.slug),
      ["patrimonio"]
    )
  })

  it("matches an alias and a definition", () => {
    assert.deepEqual(
      filterHelpTerms(TERMS, "net worth").map((term) => term.slug),
      ["patrimonio"]
    )
    assert.deepEqual(
      filterHelpTerms(TERMS, "movimientos").map((term) => term.slug),
      ["descuadre"]
    )
  })

  it("returns nothing when no term matches", () => {
    assert.deepEqual(filterHelpTerms(TERMS, "hipoteca"), [])
  })
})

describe("hasHelpSearch", () => {
  it("ignores whitespace", () => {
    assert.equal(hasHelpSearch("  "), false)
    assert.equal(hasHelpSearch("cuota"), true)
  })
})

describe("groupHelpTerms", () => {
  it("follows the category order and hides empty groups", () => {
    const groups = groupHelpTerms({ terms: TERMS, categories: CATEGORIES })
    assert.deepEqual(
      groups.map((group) => group.label),
      ["Dinero", "Planificación"]
    )
    assert.deepEqual(
      groups[0]?.terms.map((term) => term.slug),
      ["patrimonio", "descuadre"]
    )
  })
})

describe("findHelpTerm", () => {
  it("finds a term by slug and ignores surrounding spaces", () => {
    assert.equal(findHelpTerm(TERMS, "  CUOTA ")?.slug, "cuota")
  })

  it("returns null for a missing or empty slug", () => {
    assert.equal(findHelpTerm(TERMS, "missing"), null)
    assert.equal(findHelpTerm(TERMS, null), null)
  })
})

describe("parseHelpTermParam", () => {
  it("trims and lowercases the query value", () => {
    assert.equal(parseHelpTermParam(" Patrimonio "), "patrimonio")
  })

  it("returns null when the value is absent", () => {
    assert.equal(parseHelpTermParam(undefined), null)
    assert.equal(parseHelpTermParam("   "), null)
  })
})
