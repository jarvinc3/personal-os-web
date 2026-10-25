import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceMerchant,
  FinanceMerchantDuplicate,
} from "@/src/modules/finance/shared/types/entities.ts"
import {
  duplicateNamesLabel,
  duplicateReasonLabel,
  hasSuggestedCategory,
} from "./merchant-duplicates.ts"

function merchant(
  partial: Partial<FinanceMerchant> & Pick<FinanceMerchant, "id">
): FinanceMerchant {
  return {
    name: "Comercio",
    normalizedKey: "comercio",
    aliases: [],
    categoryId: null,
    categorySource: null,
    logoUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    monthSpend: "0",
    monthMovements: 0,
    ...partial,
  }
}

function candidate(
  partial: Partial<FinanceMerchantDuplicate> &
    Pick<FinanceMerchantDuplicate, "id">
): FinanceMerchantDuplicate {
  return {
    name: "Otro",
    logoUrl: null,
    monthSpend: "0",
    monthMovements: 0,
    reason: "SAME_KEY",
    ...partial,
  }
}

describe("hasSuggestedCategory", () => {
  it("marks a category the app chose", () => {
    assert.equal(
      hasSuggestedCategory(merchant({ id: "m1", categorySource: "LEARNED" })),
      true
    )
    assert.equal(
      hasSuggestedCategory(merchant({ id: "m2", categorySource: "KEYWORD" })),
      true
    )
  })

  it("leaves a category the user chose alone", () => {
    assert.equal(
      hasSuggestedCategory(merchant({ id: "m3", categorySource: "MANUAL" })),
      false
    )
    assert.equal(hasSuggestedCategory(merchant({ id: "m4" })), false)
  })
})

describe("duplicateReasonLabel", () => {
  it("explains every reason the back can send", () => {
    assert.match(duplicateReasonLabel("SAME_KEY"), /Mismo nombre/)
    assert.match(duplicateReasonLabel("TRAILING_NUMBER"), /número final/)
    assert.match(duplicateReasonLabel("NAME_CONTAINED"), /contiene/)
    assert.match(duplicateReasonLabel("ALIAS_MATCH"), /alternativo/)
    assert.match(duplicateReasonLabel("SIMILAR_NAME"), /casi igual/)
  })
})

describe("duplicateNamesLabel", () => {
  it("names one or two candidates and counts the rest", () => {
    assert.equal(duplicateNamesLabel([]), "")
    assert.equal(
      duplicateNamesLabel([candidate({ id: "a", name: "Netflix" })]),
      "«Netflix»"
    )
    assert.equal(
      duplicateNamesLabel([
        candidate({ id: "a", name: "Netflix" }),
        candidate({ id: "b", name: "Netflix 2" }),
      ]),
      "«Netflix» y «Netflix 2»"
    )
    assert.equal(
      duplicateNamesLabel([
        candidate({ id: "a", name: "Netflix" }),
        candidate({ id: "b", name: "Netflix 2" }),
        candidate({ id: "c", name: "Netflix 3" }),
      ]),
      "«Netflix» y «Netflix 2» y 1 más"
    )
  })
})
