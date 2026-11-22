import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { HELP_TERMS } from "@/src/modules/help/constants/glossary"
import { SHEET_GLOSSARY_TERMS } from "@/src/modules/help/constants/sheet-terms"
import {
  glossarySlugsForSheet,
  glossaryPickerKey,
} from "@/src/modules/help/lib/sheet-glossary"

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_TERMS_PER_SHEET = 5
const TERM_SLUGS = new Set(HELP_TERMS.map((term) => term.slug))

describe("sheet glossary map", () => {
  it("points every sheet to real, unique glossary terms", () => {
    for (const [sheetKey, slugs] of Object.entries(SHEET_GLOSSARY_TERMS)) {
      assert.match(sheetKey, KEBAB_CASE)
      assert.ok(
        slugs.length > 0 && slugs.length <= MAX_TERMS_PER_SHEET,
        `${sheetKey} must explain between 1 and ${MAX_TERMS_PER_SHEET} terms`
      )
      assert.equal(
        new Set<string>(slugs).size,
        slugs.length,
        `${sheetKey} repeats a term`
      )
      for (const slug of slugs) {
        assert.match(slug, KEBAB_CASE)
        assert.ok(
          TERM_SLUGS.has(slug),
          `${sheetKey} points to missing glossary term ${slug}`
        )
      }
    }
  })

  it("returns the mapped terms and nothing for other sheets", () => {
    assert.deepEqual(
      glossarySlugsForSheet("account-sheet"),
      SHEET_GLOSSARY_TERMS["account-sheet"]
    )
    assert.deepEqual(glossarySlugsForSheet("agent-chat"), [])
    assert.deepEqual(glossarySlugsForSheet("not-a-sheet"), [])
  })
})

describe("sheet glossary picker", () => {
  it("names the nested sheet after the parent", () => {
    assert.equal(
      glossaryPickerKey("account-sheet"),
      "sheet-glossary:account-sheet"
    )
  })

  it("uses the same scheme for a single term", () => {
    assert.equal(glossaryPickerKey("saldo"), "sheet-glossary:saldo")
  })
})
