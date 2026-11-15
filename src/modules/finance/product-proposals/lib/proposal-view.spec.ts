import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  PROPOSAL_EVIDENCE_PREVIEW,
  proposalEvidenceRows,
  proposalKindLabel,
  proposalLastFourLabel,
  proposalNetworkLabel,
  proposalProductDetail,
  proposalTypeLabel,
} from "./proposal-view.ts"
import type {
  EmailProductProposal,
  EmailProductProposalEvidence,
} from "@/src/modules/finance/shared/types/entities.ts"

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

function evidenceOf(
  overrides: Partial<EmailProductProposalEvidence>
): EmailProductProposalEvidence {
  return {
    messageId: "message-1",
    fromDomain: "bhd.com.do",
    subject: "Tu cuenta de ahorros",
    receivedAt: "2026-10-01T12:00:00.000Z",
    match: {},
    createdAt: "2026-10-01T12:00:00.000Z",
    ...overrides,
  }
}

describe("proposalKindLabel", () => {
  it("names each product type", () => {
    assert.equal(proposalKindLabel(proposalOf()), "Cuenta")
    assert.equal(
      proposalKindLabel(proposalOf({ productType: "CARD" })),
      "Tarjeta"
    )
  })
})

describe("proposalTypeLabel", () => {
  it("translates the account and card types", () => {
    assert.equal(proposalTypeLabel(proposalOf()), "Ahorros")
    assert.equal(
      proposalTypeLabel(
        proposalOf({
          productType: "CARD",
          draft: { ...proposalOf().draft, cardType: "CREDIT" },
        })
      ),
      "Crédito"
    )
  })

  it("says the type is missing instead of inventing one", () => {
    assert.equal(
      proposalTypeLabel(
        proposalOf({
          draft: { ...proposalOf().draft, accountType: null },
        })
      ),
      "Sin tipo"
    )
  })
})

describe("proposalNetworkLabel", () => {
  it("only applies to cards with a detected network", () => {
    assert.equal(proposalNetworkLabel(proposalOf()), null)
    assert.equal(
      proposalNetworkLabel(
        proposalOf({
          productType: "CARD",
          draft: { ...proposalOf().draft, network: null },
        })
      ),
      null
    )
    assert.equal(
      proposalNetworkLabel(
        proposalOf({
          productType: "CARD",
          draft: { ...proposalOf().draft, network: "MASTERCARD" },
        })
      ),
      "Mastercard"
    )
  })
})

describe("proposalLastFourLabel", () => {
  it("masks all but the last four digits", () => {
    assert.equal(proposalLastFourLabel("5678"), "•••• 5678")
  })

  it("returns null when the four digits are missing", () => {
    assert.equal(proposalLastFourLabel(""), null)
    assert.equal(proposalLastFourLabel("678"), null)
    assert.equal(proposalLastFourLabel("5678-"), null)
  })
})

describe("proposalProductDetail", () => {
  it("lists the type, the last four and the account currency", () => {
    assert.equal(
      proposalProductDetail(proposalOf()),
      "Ahorros · •••• 5678 · DOP"
    )
  })

  it("shows the network instead of the currency on a card", () => {
    const card = proposalOf({
      productType: "CARD",
      draft: {
        ...proposalOf().draft,
        cardType: "DEBIT",
        network: "VISA",
        accountType: null,
        currency: "DOP",
      },
    })
    assert.equal(proposalProductDetail(card), "Débito · •••• 5678 · Visa")
  })
})

describe("proposalEvidenceRows", () => {
  it("shows the newest emails first", () => {
    const rows = proposalEvidenceRows({
      evidence: [
        evidenceOf({
          messageId: "old",
          subject: "Viejo",
          receivedAt: "2026-09-01T12:00:00.000Z",
        }),
        evidenceOf({
          messageId: "new",
          subject: "Nuevo",
          receivedAt: "2026-10-01T12:00:00.000Z",
        }),
      ],
      locale: "es",
    })
    assert.deepEqual(
      rows.map((row) => row.messageId),
      ["new", "old"]
    )
  })

  it("caps the preview and keeps the sender and the date", () => {
    const evidence = Array.from(
      { length: PROPOSAL_EVIDENCE_PREVIEW + 2 },
      (_, index) =>
        evidenceOf({
          messageId: `message-${index}`,
          receivedAt: `2026-10-0${index + 1}T12:00:00.000Z`,
        })
    )
    const rows = proposalEvidenceRows({ evidence, locale: "es" })
    assert.equal(rows.length, PROPOSAL_EVIDENCE_PREVIEW)
    assert.equal(rows[0]?.fromDomain, "bhd.com.do")
    assert.equal(rows[0]?.dateLabel, "5 oct 2026")
  })

  it("names an email without a subject", () => {
    const [row] = proposalEvidenceRows({
      evidence: [evidenceOf({ subject: "   " })],
      locale: "es",
    })
    assert.equal(row?.subject, "Correo sin asunto")
  })
})
