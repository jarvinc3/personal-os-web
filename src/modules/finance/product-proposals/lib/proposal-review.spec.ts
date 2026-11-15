import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { proposalApprovalReadiness } from "./proposal-review.ts"
import type { EmailProductProposal } from "@/src/modules/finance/shared/types/entities.ts"

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
    draft: {
      productType: "ACCOUNT",
      name: "Ahorros BHD",
      lastFour: "5678",
      currency: "DOP",
      accountType: "SAVINGS",
      cardType: null,
      network: null,
      accountId: null,
      institution: {
        name: "BHD",
        type: "bank",
        domain: "bhd.com.do",
        country: "DO",
      },
      accountNumberProvided: false,
    },
    ...overrides,
  }
}

function cardProposal(
  overrides: Partial<EmailProductProposal["draft"]> = {}
): EmailProductProposal {
  return proposalOf({
    productType: "CARD",
    draft: {
      ...proposalOf().draft,
      productType: "CARD",
      accountType: null,
      cardType: "CREDIT",
      ...overrides,
    },
  })
}

describe("proposalApprovalReadiness", () => {
  it("approves an account with a type and the four digits", () => {
    assert.deepEqual(proposalApprovalReadiness(proposalOf()), {
      ready: true,
      reason: null,
    })
  })

  it("approves an account with only the last four digits", () => {
    const proposal = proposalOf({
      draft: { ...proposalOf().draft, accountNumberProvided: false },
    })
    assert.equal(proposalApprovalReadiness(proposal).ready, true)
  })

  it("blocks an account without a type", () => {
    const proposal = proposalOf({
      draft: { ...proposalOf().draft, accountType: null },
    })
    assert.deepEqual(proposalApprovalReadiness(proposal), {
      ready: false,
      reason: "Elige el tipo de cuenta",
    })
  })

  it("blocks a proposal without four digits", () => {
    const proposal = proposalOf({
      draft: { ...proposalOf().draft, lastFour: "78" },
    })
    assert.equal(
      proposalApprovalReadiness(proposal).reason,
      "Faltan los últimos 4 dígitos"
    )
  })

  it("blocks a card without a type", () => {
    assert.equal(
      proposalApprovalReadiness(cardProposal({ cardType: null })).reason,
      "Elige el tipo de tarjeta"
    )
  })

  it("blocks a debit card without its account", () => {
    assert.equal(
      proposalApprovalReadiness(
        cardProposal({ cardType: "DEBIT", accountId: null })
      ).reason,
      "Asocia la cuenta de la tarjeta"
    )
  })

  it("approves a debit card with its account", () => {
    assert.equal(
      proposalApprovalReadiness(
        cardProposal({ cardType: "DEBIT", accountId: "account-1" })
      ).ready,
      true
    )
  })

  it("approves a credit card without an account", () => {
    assert.equal(
      proposalApprovalReadiness(cardProposal({ cardType: "CREDIT" })).ready,
      true
    )
  })

  it("does not approve twice", () => {
    const approved = proposalOf({ status: "APPROVED" })
    assert.deepEqual(proposalApprovalReadiness(approved), {
      ready: false,
      reason: "La propuesta ya está resuelta",
    })
  })
})
