import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { HELP_TERMS } from "@/src/modules/help/constants/glossary"
import { glossaryTermsForSlugs } from "@/src/modules/help/lib/glossary-terms"

describe("glossaryTermsForSlugs", () => {
  it("keeps the requested order", () => {
    const terms = glossaryTermsForSlugs(["cuota", "prestamo", "interes"])
    assert.deepEqual(
      terms.map((term) => term.slug),
      ["cuota", "prestamo", "interes"]
    )
  })

  it("skips unknown slugs and repeats", () => {
    const terms = glossaryTermsForSlugs([
      "cuota",
      "missing-term",
      "cuota",
      "interes",
    ])
    assert.deepEqual(
      terms.map((term) => term.slug),
      ["cuota", "interes"]
    )
  })

  it("returns the canonical term from the glossary", () => {
    const [term] = glossaryTermsForSlugs(["patrimonio"])
    assert.equal(
      term,
      HELP_TERMS.find((item) => item.slug === "patrimonio")
    )
  })
})
