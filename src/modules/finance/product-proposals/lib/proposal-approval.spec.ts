import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  accountApprovalPrefill,
  cardApprovalPrefill,
  initialApprovalStep,
  initialInstitutionId,
  institutionApprovalPrefill,
  proposalInstitutionType,
  proposalReviewHint,
  sortProposalsForReview,
} from "./proposal-approval.ts"
import type {
  EmailProductProposal,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities.ts"

function institutionOf(
  overrides: Partial<FinanceInstitution> = {}
): FinanceInstitution {
  return {
    id: "institution-bhd",
    name: "BHD",
    type: "bank",
    color: null,
    logoUrl: null,
    country: "DO",
    isActive: true,
    ...overrides,
  }
}

function proposalOf(
  overrides: Partial<EmailProductProposal> = {}
): EmailProductProposal {
  return {
    id: "proposal-1",
    productType: "ACCOUNT",
    status: "PENDING",
    approvedProductId: null,
    createdAt: "2026-10-01T12:00:00.000Z",
    evidence: [],
    matchedProductId: null,
    matchedProductIds: [],
    draft: {
      productType: "ACCOUNT",
      name: "Ahorros BHD",
      lastFour: "0016",
      currency: "DOP",
      accountType: "SAVINGS",
      cardType: null,
      network: null,
      accountId: null,
      accountNumberProvided: false,
      institution: {
        name: "BHD",
        type: "bank",
        domain: "bhd.com.do",
        country: "DO",
        matchedInstitutionId: "institution-bhd",
        matchedInstitutionIds: ["institution-bhd"],
      },
    },
    ...overrides,
  }
}

function cardProposal(
  draft: Partial<EmailProductProposal["draft"]> = {},
  overrides: Partial<EmailProductProposal> = {}
): EmailProductProposal {
  return proposalOf({
    ...overrides,
    productType: "CARD",
    draft: {
      ...proposalOf().draft,
      productType: "CARD",
      accountType: null,
      cardType: "DEBIT",
      lastFour: "6506",
      network: "VISA",
      institution: {
        ...proposalOf().draft.institution,
        matchedInstitutionId: null,
        matchedInstitutionIds: [],
      },
      ...draft,
    },
  })
}

describe("proposalInstitutionType", () => {
  it("keeps a type the contract lists", () => {
    assert.equal(proposalInstitutionType("credit_union"), "credit_union")
  })

  it("edits an unknown type as other", () => {
    assert.equal(proposalInstitutionType("cooperative"), "other")
  })
})

describe("institutionApprovalPrefill", () => {
  it("prefills the native institution form from the draft", () => {
    assert.deepEqual(institutionApprovalPrefill(proposalOf()), {
      name: "BHD",
      type: "bank",
      country: "DO",
      domain: "bhd.com.do",
    })
  })

  it("normalizes the country and an unknown type", () => {
    const proposal = proposalOf({
      draft: {
        ...proposalOf().draft,
        institution: {
          ...proposalOf().draft.institution,
          type: "cooperative",
          country: "do",
          domain: null,
        },
      },
    })
    assert.deepEqual(institutionApprovalPrefill(proposal), {
      name: "BHD",
      type: "other",
      country: "DO",
      domain: "",
    })
  })
})

describe("accountApprovalPrefill", () => {
  it("prefills name, type, currency and the four digits", () => {
    assert.deepEqual(accountApprovalPrefill(proposalOf()), {
      name: "Ahorros BHD",
      type: "SAVINGS",
      currency: "DOP",
      lastFour: "0016",
    })
  })

  it("leaves the type for the user when the email did not say it", () => {
    assert.equal(
      accountApprovalPrefill(
        proposalOf({
          draft: { ...proposalOf().draft, accountType: null },
        })
      ).type,
      undefined
    )
  })
})

describe("cardApprovalPrefill", () => {
  it("prefills the card with its type, four digits and network", () => {
    assert.deepEqual(cardApprovalPrefill(cardProposal()), {
      name: "Ahorros BHD",
      type: "DEBIT",
      lastFour: "6506",
      network: "VISA",
      accountId: undefined,
    })
  })

  it("leaves the type and the network to the native form when missing", () => {
    const prefill = cardApprovalPrefill(
      cardProposal({ cardType: null, network: null })
    )
    assert.equal(prefill.type, undefined)
    assert.equal(prefill.network, undefined)
  })
})

describe("initialInstitutionId", () => {
  it("selects the compatible institution the user has", () => {
    assert.equal(
      initialInstitutionId({
        proposal: proposalOf(),
        institutions: [institutionOf()],
      }),
      "institution-bhd"
    )
  })

  it("reuses the compatible institution even when archived", () => {
    assert.equal(
      initialInstitutionId({
        proposal: proposalOf(),
        institutions: [institutionOf({ isActive: false })],
      }),
      "institution-bhd"
    )
  })

  it("returns null when there is no match or it is not in the list", () => {
    assert.equal(
      initialInstitutionId({
        proposal: cardProposal(),
        institutions: [institutionOf()],
      }),
      null
    )
    assert.equal(
      initialInstitutionId({
        proposal: proposalOf(),
        institutions: [],
      }),
      null
    )
  })
})

describe("initialApprovalStep", () => {
  it("skips the institution step when it is resolved", () => {
    assert.equal(
      initialApprovalStep({
        proposal: proposalOf(),
        institutions: [institutionOf()],
      }),
      "product"
    )
  })

  it("starts with the institution when it is not", () => {
    assert.equal(
      initialApprovalStep({
        proposal: cardProposal(),
        institutions: [institutionOf()],
      }),
      "institution"
    )
  })
})

describe("sortProposalsForReview", () => {
  it("puts accounts before cards and keeps the rest of the order", () => {
    const cardA = cardProposal({}, { id: "card-a" })
    const accountA = proposalOf({ id: "account-a" })
    const cardB = cardProposal({}, { id: "card-b" })
    const accountB = proposalOf({ id: "account-b" })

    assert.deepEqual(
      sortProposalsForReview([cardA, accountA, cardB, accountB]).map(
        (proposal) => proposal.id
      ),
      ["account-a", "account-b", "card-a", "card-b"]
    )
  })
})

describe("proposalReviewHint", () => {
  it("asks for the type when the email did not say it", () => {
    assert.equal(
      proposalReviewHint(
        proposalOf({
          draft: { ...proposalOf().draft, accountType: null },
        })
      ),
      "Falta elegir el tipo."
    )
    assert.equal(
      proposalReviewHint(cardProposal({ cardType: null })),
      "Falta elegir el tipo."
    )
  })

  it("asks for a debit card account first", () => {
    assert.equal(
      proposalReviewHint(cardProposal({ accountId: null })),
      "Necesita una cuenta; apruébala primero."
    )
  })

  it("stays silent when everything needed is there", () => {
    assert.equal(proposalReviewHint(proposalOf()), null)
    assert.equal(
      proposalReviewHint(cardProposal({ accountId: "account-1" })),
      null
    )
    assert.equal(proposalReviewHint(cardProposal({ cardType: "CREDIT" })), null)
  })
})
