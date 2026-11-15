import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildProposalPatch,
  proposalFormSchemaFor,
  toProposalFormValues,
} from "./proposal-form.ts"
import type { EmailProductProposal } from "@/src/modules/finance/shared/types/entities.ts"

function accountProposal(
  draft: Partial<EmailProductProposal["draft"]> = {}
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
      ...draft,
    },
  }
}

function cardProposal(
  draft: Partial<EmailProductProposal["draft"]> = {}
): EmailProductProposal {
  return {
    id: "proposal-2",
    productType: "CARD",
    status: "PENDING",
    approvedProductId: null,
    createdAt: "2026-10-01T12:00:00.000Z",
    evidence: [],
    draft: {
      productType: "CARD",
      name: "Visa BHD",
      lastFour: "4321",
      currency: "DOP",
      accountType: null,
      cardType: "CREDIT",
      network: "VISA",
      accountId: "account-1",
      institution: {
        name: "BHD",
        type: "bank",
        domain: null,
        country: "DO",
      },
      accountNumberProvided: false,
      ...draft,
    },
  }
}

function issuesOf(
  proposal: EmailProductProposal,
  values: ReturnType<typeof toProposalFormValues>
): string[] {
  const parsed = proposalFormSchemaFor(proposal).safeParse(values)
  if (parsed.success) {
    return []
  }
  return parsed.error.issues.map(
    (issue) => `${issue.path.join(".")}:${issue.message}`
  )
}

describe("toProposalFormValues", () => {
  it("starts from the draft, including the institution", () => {
    const values = toProposalFormValues(accountProposal())
    assert.deepEqual(values, {
      name: "Ahorros BHD",
      type: "SAVINGS",
      currency: "DOP",
      lastFour: "5678",
      network: "OTHER",
      accountId: null,
      accountNumber: "",
      institutionName: "BHD",
      institutionType: "bank",
      institutionCountry: "DO",
      institutionDomain: "bhd.com.do",
    })
  })

  it("keeps the card type and its network", () => {
    const values = toProposalFormValues(cardProposal())
    assert.equal(values.type, "CREDIT")
    assert.equal(values.network, "VISA")
    assert.equal(values.accountId, "account-1")
  })

  it("proposes a type when the email did not detect one", () => {
    const values = toProposalFormValues(accountProposal({ accountType: null }))
    assert.equal(values.type, "CHECKING")
    assert.equal(
      toProposalFormValues(cardProposal({ cardType: null })).type,
      "CREDIT"
    )
  })

  it("edits an unknown institution type as other", () => {
    const values = toProposalFormValues(
      accountProposal({
        institution: {
          name: "Banco",
          type: "cooperative",
          domain: null,
          country: "do",
        },
      })
    )
    assert.equal(values.institutionType, "other")
    assert.equal(values.institutionCountry, "DO")
    assert.equal(values.institutionDomain, "")
  })
})

describe("proposalFormSchemaFor", () => {
  it("accepts the draft as it arrives, for an account and for a card", () => {
    assert.deepEqual(
      issuesOf(accountProposal(), toProposalFormValues(accountProposal())),
      []
    )
    assert.deepEqual(
      issuesOf(cardProposal(), toProposalFormValues(cardProposal())),
      []
    )
  })

  it("approves an account with only the last four digits", () => {
    const proposal = accountProposal({ accountNumberProvided: false })
    assert.deepEqual(issuesOf(proposal, toProposalFormValues(proposal)), [])
  })

  it("asks for three letters in the account currency", () => {
    const proposal = accountProposal()
    const values = { ...toProposalFormValues(proposal), currency: "DO" }
    assert.deepEqual(issuesOf(proposal, values), [
      "currency:Moneda de 3 letras",
    ])
  })

  it("rejects the card type on an account", () => {
    const proposal = accountProposal()
    const values = { ...toProposalFormValues(proposal), type: "CREDIT" }
    assert.deepEqual(issuesOf(proposal, values), [
      "type:Elige el tipo de cuenta",
    ])
  })

  it("rejects the account type on a card", () => {
    const proposal = cardProposal()
    const values = { ...toProposalFormValues(proposal), type: "SAVINGS" }
    assert.deepEqual(issuesOf(proposal, values), [
      "type:Elige el tipo de tarjeta",
    ])
  })

  it("accepts a full number that ends in the last four", () => {
    const proposal = accountProposal()
    const values = {
      ...toProposalFormValues(proposal),
      accountNumber: "0011-2233-5678",
    }
    assert.deepEqual(issuesOf(proposal, values), [])
  })

  it("rejects a full number with other ending", () => {
    const proposal = accountProposal()
    const values = {
      ...toProposalFormValues(proposal),
      accountNumber: "0011-2233-9999",
    }
    assert.deepEqual(issuesOf(proposal, values), [
      "accountNumber:El número no termina en esos 4 dígitos",
    ])
  })

  it("rejects an empty number typed as digits", () => {
    const proposal = accountProposal()
    const values = { ...toProposalFormValues(proposal), accountNumber: "12" }
    assert.deepEqual(issuesOf(proposal, values), [
      "accountNumber:Número de 4 a 34 dígitos",
    ])
  })

  it("asks for the full number when the stored one no longer matches", () => {
    const proposal = accountProposal({ accountNumberProvided: true })
    const values = { ...toProposalFormValues(proposal), lastFour: "1234" }
    assert.deepEqual(issuesOf(proposal, values), [
      "accountNumber:Escribe el número completo: cambiaste los últimos 4",
    ])
  })

  it("accepts the new last four when the full number comes too", () => {
    const proposal = accountProposal({ accountNumberProvided: true })
    const values = {
      ...toProposalFormValues(proposal),
      lastFour: "1234",
      accountNumber: "001122331234",
    }
    assert.deepEqual(issuesOf(proposal, values), [])
  })

  it("does not ask for the full number when the four digits stay", () => {
    const proposal = accountProposal({ accountNumberProvided: true })
    assert.deepEqual(issuesOf(proposal, toProposalFormValues(proposal)), [])
  })

  it("ignores the account fields on a card", () => {
    const proposal = cardProposal()
    const values = {
      ...toProposalFormValues(proposal),
      currency: "",
      accountNumber: "12",
    }
    assert.deepEqual(issuesOf(proposal, values), [])
  })
})

describe("buildProposalPatch", () => {
  it("sends only account fields for an account", () => {
    const proposal = accountProposal()
    const body = buildProposalPatch({
      proposal,
      values: toProposalFormValues(proposal),
    })
    assert.deepEqual(body, {
      name: "Ahorros BHD",
      lastFour: "5678",
      accountType: "SAVINGS",
      currency: "DOP",
      institutionName: "BHD",
      institutionType: "bank",
      institutionDomain: "bhd.com.do",
      institutionCountry: "DO",
    })
  })

  it("adds the full number only when it was written", () => {
    const proposal = accountProposal()
    const body = buildProposalPatch({
      proposal,
      values: {
        ...toProposalFormValues(proposal),
        accountNumber: "0011 2233 5678",
        currency: "usd",
      },
    })
    assert.equal(body.accountNumber, "0011 2233 5678")
    assert.equal(body.currency, "USD")
  })

  it("clears the domain when the field is empty", () => {
    const proposal = accountProposal()
    const body = buildProposalPatch({
      proposal,
      values: { ...toProposalFormValues(proposal), institutionDomain: "" },
    })
    assert.equal(body.institutionDomain, null)
  })

  it("sends only card fields for a card", () => {
    const proposal = cardProposal()
    const body = buildProposalPatch({
      proposal,
      values: toProposalFormValues(proposal),
    })
    assert.deepEqual(body, {
      name: "Visa BHD",
      lastFour: "4321",
      cardType: "CREDIT",
      accountId: "account-1",
      institutionName: "BHD",
      institutionType: "bank",
      institutionDomain: null,
      institutionCountry: "DO",
    })
    assert.equal("currency" in body, false)
    assert.equal("accountType" in body, false)
    assert.equal("accountNumber" in body, false)
  })

  it("sends the network only when it changed from the draft", () => {
    const proposal = cardProposal({ network: "VISA" })
    const kept = buildProposalPatch({
      proposal,
      values: toProposalFormValues(proposal),
    })
    assert.equal("network" in kept, false)

    const changed = buildProposalPatch({
      proposal,
      values: { ...toProposalFormValues(proposal), network: "MASTERCARD" },
    })
    assert.equal(changed.network, "MASTERCARD")
  })

  it("sends the chosen network when the email did not detect one", () => {
    const proposal = cardProposal({ network: null })
    const body = buildProposalPatch({
      proposal,
      values: toProposalFormValues(proposal),
    })
    assert.equal(body.network, "OTHER")
  })

  it("can clear the account of a credit card", () => {
    const proposal = cardProposal()
    const body = buildProposalPatch({
      proposal,
      values: { ...toProposalFormValues(proposal), accountId: null },
    })
    assert.equal(body.accountId, null)
  })
})
