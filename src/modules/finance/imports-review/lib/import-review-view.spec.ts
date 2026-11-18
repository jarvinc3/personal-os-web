import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { ApiError } from "@/src/config/api-client.utils.ts"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { ImportReviewCandidate } from "@/src/modules/finance/shared/types/entities"

import {
  importReviewAmountLabel,
  importReviewMovementLabel,
  importReviewProductLabel,
  importReviewReasonLabel,
  importReviewReceivedLabel,
  importReviewRows,
  isImportReviewEndpointUnavailable,
  readImportReviewCandidate,
  readImportReviewItem,
} from "./import-review-view.ts"

const display: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

function candidateOf(
  overrides: Partial<ImportReviewCandidate> = {}
): ImportReviewCandidate {
  return {
    amount: 2500,
    currency: "DOP",
    transactionDate: "2026-11-10T14:30:00.000Z",
    suggestedTransactionDate: null,
    merchant: "Supermercado",
    bankReference: "REF-1",
    movementClass: "PURCHASE",
    last4: "4821",
    accountNumberLast4: null,
    ...overrides,
  }
}

describe("readImportReviewCandidate", () => {
  it("keeps only the fields the queue paints", () => {
    const candidate = readImportReviewCandidate({
      amount: 2500,
      currency: "DOP",
      transactionDate: "2026-11-10T14:30:00.000Z",
      suggestedTransactionDate: "2026-11-09T00:00:00.000Z",
      merchant: "Supermercado",
      bankReference: "REF-1",
      movementClass: "PURCHASE",
      last4: "4821",
      accountNumberLast4: "0016",
      direction: "DEBIT",
      confidence: 0.8,
    })

    assert.deepEqual(candidate, {
      amount: 2500,
      currency: "DOP",
      transactionDate: "2026-11-10T14:30:00.000Z",
      suggestedTransactionDate: "2026-11-09T00:00:00.000Z",
      merchant: "Supermercado",
      bankReference: "REF-1",
      movementClass: "PURCHASE",
      last4: "4821",
      accountNumberLast4: "0016",
    })
  })

  it("returns nulls for a missing or malformed candidate", () => {
    for (const value of [null, undefined, "texto", 42, []]) {
      assert.deepEqual(readImportReviewCandidate(value), {
        amount: null,
        currency: null,
        transactionDate: null,
        suggestedTransactionDate: null,
        merchant: null,
        bankReference: null,
        movementClass: null,
        last4: null,
        accountNumberLast4: null,
      })
    }
  })

  it("rejects wrong types instead of coercing them", () => {
    const candidate = readImportReviewCandidate({
      amount: "2500",
      currency: 123,
      merchant: "   ",
    })

    assert.equal(candidate.amount, null)
    assert.equal(candidate.currency, null)
    assert.equal(candidate.merchant, null)
  })
})

describe("readImportReviewItem", () => {
  it("validates the candidate and keeps the signal data", () => {
    const item = readImportReviewItem({
      id: "import-1",
      signalId: "signal-1",
      sourceEmailMessageId: "message-1",
      reviewReason: "NO_LEDGER_TARGET",
      candidate: { amount: 2500, merchant: "Supermercado" },
      createdAt: "2026-11-10T15:00:00.000Z",
      updatedAt: "2026-11-10T15:00:00.000Z",
    })

    assert.equal(item.id, "import-1")
    assert.equal(item.reviewReason, "NO_LEDGER_TARGET")
    assert.equal(item.candidate.amount, 2500)
    assert.equal(item.candidate.merchant, "Supermercado")
    assert.equal(item.candidate.bankReference, null)
  })
})

describe("importReviewReasonLabel", () => {
  it("translates a known code", () => {
    assert.equal(
      importReviewReasonLabel("CARD_PAYMENT_SOURCE_ACCOUNT_AMBIGUOUS"),
      "Varias cuentas de origen coinciden"
    )
  })

  it("shows an unknown code instead of hiding it", () => {
    assert.equal(
      importReviewReasonLabel("ALGO_NUEVO_DEL_BACK"),
      "ALGO_NUEVO_DEL_BACK"
    )
  })

  it("explains a missing reason", () => {
    assert.equal(importReviewReasonLabel(null), "Sin motivo indicado")
  })
})

describe("importReviewMovementLabel", () => {
  it("translates the movement class", () => {
    assert.equal(importReviewMovementLabel("CARD_PAYMENT"), "Pago de tarjeta")
  })

  it("returns null when there is nothing to translate", () => {
    assert.equal(importReviewMovementLabel(null), null)
    assert.equal(importReviewMovementLabel("DESCONOCIDO"), null)
  })
})

describe("importReviewAmountLabel", () => {
  it("formats the amount in the candidate currency", () => {
    assert.match(importReviewAmountLabel(candidateOf(), display) ?? "", /2,500/)
  })

  it("omits the amount when the candidate has no currency", () => {
    const label = importReviewAmountLabel(
      candidateOf({ currency: null }),
      display
    )

    assert.equal(label, null)
  })

  it("returns null without an amount", () => {
    assert.equal(
      importReviewAmountLabel(candidateOf({ amount: null }), display),
      null
    )
  })
})

describe("importReviewProductLabel", () => {
  it("labels the account, the card or both", () => {
    assert.equal(
      importReviewProductLabel(candidateOf({ accountNumberLast4: "0016" })),
      "Cuenta ****0016 · Tarjeta ****4821"
    )
    assert.equal(
      importReviewProductLabel(
        candidateOf({ accountNumberLast4: null, last4: "4821" })
      ),
      "Tarjeta ****4821"
    )
    assert.equal(
      importReviewProductLabel(
        candidateOf({ accountNumberLast4: null, last4: null })
      ),
      null
    )
  })
})

describe("importReviewRows", () => {
  it("skips the rows the candidate does not have", () => {
    const rows = importReviewRows(
      candidateOf({ merchant: null, bankReference: null, last4: null }),
      display
    )

    assert.deepEqual(
      rows.map((row) => row.label),
      ["Fecha"]
    )
  })

  it("marks a header date as suggested", () => {
    const rows = importReviewRows(
      candidateOf({
        transactionDate: null,
        suggestedTransactionDate: "2026-11-09T00:00:00.000Z",
      }),
      display
    )

    assert.equal(rows[0].label, "Fecha sugerida")
  })

  it("lists amount-free data when the candidate has it", () => {
    const rows = importReviewRows(candidateOf(), display)

    assert.deepEqual(
      rows.map((row) => row.label),
      ["Fecha", "Comercio", "Referencia", "Producto"]
    )
    assert.equal(rows[1].value, "Supermercado")
  })
})

describe("importReviewReceivedLabel", () => {
  it("labels when the import entered review", () => {
    assert.match(
      importReviewReceivedLabel("2026-11-10T15:00:00.000Z", "es-DO") ?? "",
      /En revisión desde el .*2026/
    )
  })

  it("returns null without a date", () => {
    assert.equal(importReviewReceivedLabel("", "es-DO"), null)
  })
})

describe("isImportReviewEndpointUnavailable", () => {
  it("treats a 404 as an environment without the endpoint", () => {
    assert.equal(
      isImportReviewEndpointUnavailable(new ApiError(404, "Not Found")),
      true
    )
  })

  it("does not hide real failures", () => {
    assert.equal(
      isImportReviewEndpointUnavailable(new ApiError(500, "Server Error")),
      false
    )
    assert.equal(isImportReviewEndpointUnavailable(new Error("fallo")), false)
    assert.equal(isImportReviewEndpointUnavailable(null), false)
  })
})
