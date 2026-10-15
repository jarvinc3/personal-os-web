import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  activeChatContext,
  registerChatContext,
  unregisterChatContext,
  type ChatContextRegistration,
} from "./chat-context-registry.ts"

const loanContext = {
  moduleSlug: "finance",
  screen: "loan-detail",
  entityRef: { type: "loan" as const, id: "loan-1" },
  entityLabel: "BHD",
}

const installmentContext = {
  moduleSlug: "finance",
  screen: "loan-installment-detail",
  entityRef: { type: "loan_installment" as const, id: "installment-1" },
  entityLabel: "Cuota 3",
}

const loanRegistration: ChatContextRegistration = {
  id: "screen",
  context: loanContext,
}

const installmentRegistration: ChatContextRegistration = {
  id: "sheet",
  context: installmentContext,
}

describe("activeChatContext", () => {
  it("returns null without registrations", () => {
    assert.equal(activeChatContext([]), null)
  })

  it("reveals the newest registration", () => {
    assert.deepEqual(
      activeChatContext([loanRegistration, installmentRegistration]),
      installmentContext
    )
  })

  it("skips a registration that reports no context", () => {
    assert.deepEqual(
      activeChatContext([loanRegistration, { id: "sheet", context: null }]),
      loanContext
    )
  })

  it("returns null when every registration is empty", () => {
    assert.equal(activeChatContext([{ id: "screen", context: null }]), null)
  })
})

describe("registerChatContext", () => {
  it("appends the newest registration", () => {
    assert.deepEqual(
      registerChatContext([loanRegistration], installmentRegistration),
      [loanRegistration, installmentRegistration]
    )
  })

  it("moves an existing registration to the end", () => {
    const refreshed = { ...loanRegistration, context: installmentContext }

    assert.deepEqual(
      registerChatContext(
        [loanRegistration, installmentRegistration],
        refreshed
      ),
      [installmentRegistration, refreshed]
    )
  })
})

describe("unregisterChatContext", () => {
  it("removes only the matching registration", () => {
    assert.deepEqual(
      unregisterChatContext(
        [loanRegistration, installmentRegistration],
        "sheet"
      ),
      [loanRegistration]
    )
  })

  it("reveals the screen below after the sheet unmounts", () => {
    const withoutSheet = unregisterChatContext(
      [loanRegistration, installmentRegistration],
      "sheet"
    )

    assert.deepEqual(activeChatContext(withoutSheet), loanContext)
  })
})
