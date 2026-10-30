import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  canPromoteKnowledge,
  canRevertKnowledge,
  groupKnowledgeByState,
  knowledgeCountsLabel,
  knowledgeDescription,
  knowledgeExportFilename,
  knowledgeKey,
  knowledgeLabelSummary,
  knowledgeTitle,
} from "./knowledge.ts"
import type {
  KnowledgeItem,
  KnowledgeLabel,
  KnowledgeScope,
  KnowledgeState,
  KnowledgeType,
} from "./types/knowledge.types"

type ItemInput = {
  id: string
  scope: KnowledgeScope
  knowledgeType: KnowledgeType
  state: KnowledgeState
}

function knowledgeItem({
  id,
  scope,
  knowledgeType,
  state,
}: ItemInput): KnowledgeItem {
  return {
    id,
    scope,
    userId: scope === "USER" ? "user-1" : null,
    knowledgeType,
    knowledgeKey: "alerts@bank.com",
    state,
    payload: {
      label: {
        relevance: true,
        semanticType: "FIN_TRANSACTION",
        routes: ["FINANCE"],
        transaction: { kind: "TRANSACTION" },
      },
    },
    messagesSeen: 3,
    rejectedMessages: 0,
    distinctUsers: 2,
    humanVerifiedCount: 1,
    promotedBy: scope === "GLOBAL" ? "AUTO" : null,
    projectorVersion: "1",
    policyVersion: "1",
    normalizerVersion: "1",
    sanitizerVersion: "1",
    firstSeenAt: "2026-10-01T00:00:00.000Z",
    lastSeenAt: "2026-10-02T00:00:00.000Z",
    updatedAt: "2026-10-03T00:00:00.000Z",
  }
}

describe("knowledge key and title", () => {
  it("shows sender keys only in personal knowledge", () => {
    const personal = knowledgeItem({
      id: "p1",
      scope: "USER",
      knowledgeType: "EMAIL_SENDER",
      state: "STABLE",
    })
    const global = knowledgeItem({
      id: "g1",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_SENDER",
      state: "STABLE",
    })

    assert.equal(knowledgeKey(personal), "alerts@bank.com")
    assert.equal(knowledgeTitle(personal), "alerts@bank.com")
    assert.equal(knowledgeKey(global), null)
    assert.equal(knowledgeTitle(global), "Remitente")
  })

  it("keeps domain and template keys in global knowledge", () => {
    const domain = knowledgeItem({
      id: "g2",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_DOMAIN",
      state: "STABLE",
    })
    domain.knowledgeKey = "bank.com"

    assert.equal(knowledgeTitle(domain), "bank.com")
  })
})

describe("knowledge label summary", () => {
  it("uses only structural label fields", () => {
    const labelWithPrivateFields = {
      relevance: true,
      semanticType: "FIN_TRANSACTION",
      routes: ["FINANCE"],
      transaction: {
        kind: "TRANSACTION",
        amount: 1250,
        merchant: "Comercio Particular",
        last4: "4821",
        bankReference: "private-ref",
      },
    } as KnowledgeLabel

    const summary = knowledgeLabelSummary(labelWithPrivateFields)

    assert.equal(summary, "Relevante · Transacción · Finanzas · Transacción")
    for (const privateValue of [
      "1250",
      "Comercio Particular",
      "4821",
      "private-ref",
    ]) {
      assert.equal(summary.includes(privateValue), false)
    }
  })

  it("tolerates missing labels and fields", () => {
    assert.equal(knowledgeLabelSummary(undefined), "Sin etiqueta")
    assert.equal(knowledgeLabelSummary({}), "Sin etiqueta")
    assert.equal(knowledgeLabelSummary({ relevance: false }), "No relevante")
  })

  it("keeps private transaction data out of the row description", () => {
    const item = knowledgeItem({
      id: "g3",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_DOMAIN",
      state: "STABLE",
    })
    item.payload = {
      label: {
        relevance: true,
        semanticType: "FIN_TRANSACTION",
        routes: ["FINANCE"],
        transaction: {
          kind: "TRANSACTION",
          amount: 1250,
          merchant: "Comercio Particular",
          last4: "4821",
        },
      } as KnowledgeLabel,
    }

    const description = knowledgeDescription(item)

    assert.match(description, /Dominio · Relevante · Transacción/)
    assert.match(description, /Promovido automáticamente/)
    for (const privateValue of ["1250", "Comercio Particular", "4821"]) {
      assert.equal(description.includes(privateValue), false)
    }
  })
})

describe("knowledge counts", () => {
  it("names messages, verifications and, in global, users", () => {
    const personal = knowledgeItem({
      id: "p2",
      scope: "USER",
      knowledgeType: "EMAIL_DOMAIN",
      state: "OBSERVED",
    })
    personal.messagesSeen = 1
    personal.humanVerifiedCount = 0

    assert.equal(knowledgeCountsLabel(personal), "1 correo")

    const global = knowledgeItem({
      id: "g4",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_DOMAIN",
      state: "STABLE",
    })
    global.messagesSeen = 3
    global.humanVerifiedCount = 2
    global.distinctUsers = 2

    assert.equal(
      knowledgeCountsLabel(global),
      "3 correos · 2 verificaciones · 2 usuarios"
    )
  })
})

describe("canPromoteKnowledge", () => {
  it("only promotes global knowledge pending review", () => {
    const pending = knowledgeItem({
      id: "g10",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_DOMAIN",
      state: "REVIEW_REQUIRED",
    })
    const stable = knowledgeItem({
      id: "g11",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_DOMAIN",
      state: "STABLE",
    })
    const personal = knowledgeItem({
      id: "p4",
      scope: "USER",
      knowledgeType: "EMAIL_DOMAIN",
      state: "REVIEW_REQUIRED",
    })

    assert.equal(canPromoteKnowledge(pending), true)
    assert.equal(canPromoteKnowledge(stable), false)
    assert.equal(canPromoteKnowledge(personal), false)
  })
})

describe("canRevertKnowledge", () => {
  it("only reverts a global promotion", () => {
    const stable = knowledgeItem({
      id: "g8",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_DOMAIN",
      state: "STABLE",
    })
    const pending = knowledgeItem({
      id: "g9",
      scope: "GLOBAL",
      knowledgeType: "EMAIL_DOMAIN",
      state: "REVIEW_REQUIRED",
    })
    const personal = knowledgeItem({
      id: "p3",
      scope: "USER",
      knowledgeType: "EMAIL_DOMAIN",
      state: "STABLE",
    })

    assert.equal(canRevertKnowledge(stable), true)
    assert.equal(canRevertKnowledge(pending), false)
    assert.equal(canRevertKnowledge(personal), false)
  })
})

describe("groupKnowledgeByState", () => {
  it("orders the global states and drops empty groups", () => {
    const items = [
      knowledgeItem({
        id: "g5",
        scope: "GLOBAL",
        knowledgeType: "EMAIL_DOMAIN",
        state: "BLOCKED",
      }),
      knowledgeItem({
        id: "g6",
        scope: "GLOBAL",
        knowledgeType: "EMAIL_DOMAIN",
        state: "REVIEW_REQUIRED",
      }),
      knowledgeItem({
        id: "g7",
        scope: "GLOBAL",
        knowledgeType: "EMAIL_TEMPLATE",
        state: "STABLE",
      }),
    ]

    const groups = groupKnowledgeByState(items)

    assert.deepEqual(
      groups.map((group) => group.state),
      ["REVIEW_REQUIRED", "STABLE", "BLOCKED"]
    )
    assert.deepEqual(
      groups.map((group) => group.items.map((item) => item.id)),
      [["g6"], ["g7"], ["g5"]]
    )
  })
})

describe("knowledgeExportFilename", () => {
  it("dates the file with the export day", () => {
    assert.equal(
      knowledgeExportFilename("2026-10-26T15:00:00.000Z"),
      "conocimiento-personal-os-2026-10-26.json"
    )
    assert.equal(
      knowledgeExportFilename("not-a-date"),
      "conocimiento-personal-os-datos.json"
    )
  })
})
