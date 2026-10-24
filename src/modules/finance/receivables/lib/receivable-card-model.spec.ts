import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceReceivable,
  FinanceReceivableStatus,
} from "@/src/modules/finance/shared/types/entities.ts"
import type { PublicReceivableShareItem } from "@/src/modules/finance/receivables/lib/public-receivable-share.ts"
import {
  receivableCardModel,
  sharedReceivableCardModel,
} from "./receivable-card-model.ts"

const DISPLAY = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es",
}

const RECEIVABLE: FinanceReceivable = {
  id: "receivable-1",
  debtorName: "Ana",
  description: null,
  amount: "10000",
  paidAmount: "4000",
  creditBalance: "0",
  writtenOffAmount: "0",
  writtenOffAt: null,
  currency: "DOP",
  dueDate: "2026-11-20",
  status: "PARTIAL",
}

const SHARED_ITEM: PublicReceivableShareItem = {
  ref: "share-1",
  concept: "Cena",
  createdAt: "2026-10-01T12:00:00.000Z",
  dueDate: null,
  amount: "5000",
  paid: "1000",
  pending: "4000",
  currency: "DOP",
  status: "PARTIAL",
  note: null,
  payments: [],
}

describe("receivableCardModel", () => {
  it("adds the remaining amount and the due date to the caption", () => {
    const model = receivableCardModel(RECEIVABLE, DISPLAY)

    assert.equal(model.title, "Ana")
    assert.equal(model.progress, 40)
    assert.equal(model.tone, "info")
    assert.equal(model.badge.variant, "info")
    assert.match(String(model.caption), /^Resta /)
    assert.match(String(model.caption), /Vence /)
  })

  it("marks a paid receivable as complete", () => {
    const model = receivableCardModel(
      { ...RECEIVABLE, status: "PAID", paidAmount: "10000" },
      DISPLAY
    )

    assert.equal(model.tone, "success")
    assert.equal(model.progress, 100)
    assert.match(String(model.caption), /Cobro completo/)
  })

  it("keeps unreadable amounts out of the progress and the sum", () => {
    const model = receivableCardModel(
      { ...RECEIVABLE, amount: "nope" },
      DISPLAY
    )

    assert.equal(model.progress, null)
    assert.match(String(model.caption), /Monto no disponible/)
  })
})

describe("sharedReceivableCardModel", () => {
  it("uses the concept and the creation date of the shared item", () => {
    const model = sharedReceivableCardModel(SHARED_ITEM, DISPLAY)

    assert.equal(model.title, "Cena")
    assert.match(String(model.description), /^Creado /)
    assert.equal(model.progress, 20)
    assert.equal(model.tone, "info")
  })

  it("celebrates a shared item already collected", () => {
    const model = sharedReceivableCardModel(
      {
        ...SHARED_ITEM,
        status: "PAID" as FinanceReceivableStatus,
        paid: "5000",
        pending: "0",
      },
      DISPLAY
    )

    assert.equal(model.tone, "success")
    assert.equal(model.progress, 100)
    assert.match(String(model.caption), /Cobro completo/)
  })
})
