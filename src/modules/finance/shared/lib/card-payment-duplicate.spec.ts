import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { ApiError } from "@/src/config/api-client.utils.ts"
import type { CreateCardPaymentBody } from "@/src/modules/finance/shared/lib/ledger-payloads.ts"
import {
  cardPaymentDuplicateDateLabel,
  cardPaymentDuplicateFromError,
  nextCardPaymentDuplicateDialog,
  type CardPaymentDuplicateDialog,
} from "./card-payment-duplicate.ts"

function conflictError(
  code: string,
  responseDetails: Record<string, unknown> | null
): ApiError {
  return new ApiError(
    409,
    "Ya hay un pago parecido importado por correo.",
    code,
    "request-1",
    "/api/finance/card-payments",
    { responseDetails }
  )
}

describe("cardPaymentDuplicateFromError", () => {
  it("reads the candidate of the duplicate conflict", () => {
    const error = conflictError("CARD_PAYMENT_POSSIBLE_DUPLICATE", {
      code: "CARD_PAYMENT_POSSIBLE_DUPLICATE",
      matchedBy: "SIMILAR",
      candidate: {
        transactionId: "tx-imported",
        transferGroupId: "group-imported",
        accountId: "account-1",
        cardId: "card-1",
        amount: "2500",
        currency: "DOP",
        transactionDate: "2026-11-10T14:30:00.000Z",
        description: "Pago de tarjeta",
      },
    })

    assert.deepEqual(cardPaymentDuplicateFromError(error), {
      amount: "2500",
      currency: "DOP",
      transactionDate: "2026-11-10T14:30:00.000Z",
    })
  })

  it("ignores another conflict code", () => {
    const error = conflictError("TRANSACTION_LOCKED", {
      candidate: { amount: "2500" },
    })

    assert.equal(cardPaymentDuplicateFromError(error), null)
  })

  it("ignores another status and errors that are not from the API", () => {
    const serverError = new ApiError(
      500,
      "boom",
      "CARD_PAYMENT_POSSIBLE_DUPLICATE"
    )

    assert.equal(cardPaymentDuplicateFromError(serverError), null)
    assert.equal(cardPaymentDuplicateFromError(new Error("boom")), null)
    assert.equal(cardPaymentDuplicateFromError(null), null)
  })

  it("returns a null candidate when the conflict brings no details", () => {
    const error = conflictError("CARD_PAYMENT_POSSIBLE_DUPLICATE", null)

    assert.deepEqual(cardPaymentDuplicateFromError(error), {
      amount: null,
      currency: null,
      transactionDate: null,
    })
  })

  it("does not coerce malformed candidate fields", () => {
    const error = conflictError("CARD_PAYMENT_POSSIBLE_DUPLICATE", {
      candidate: { amount: 2500, currency: "  ", transactionDate: null },
    })

    assert.deepEqual(cardPaymentDuplicateFromError(error), {
      amount: null,
      currency: null,
      transactionDate: null,
    })
  })
})

describe("cardPaymentDuplicateDateLabel", () => {
  it("pinta la fecha en la zona del perfil, no en UTC", () => {
    const label = cardPaymentDuplicateDateLabel(
      {
        amount: "2500",
        currency: "DOP",
        transactionDate: "2026-11-11T02:30:00.000Z",
      },
      { timeZone: "America/Santo_Domingo", locale: "es-DO" }
    )

    assert.equal(label, "10 nov 2026")
  })

  it("no devuelve fecha cuando el candidato no la trae", () => {
    assert.equal(
      cardPaymentDuplicateDateLabel(
        { amount: null, currency: null, transactionDate: null },
        { timeZone: "America/Santo_Domingo", locale: "es-DO" }
      ),
      null
    )
  })
})

describe("nextCardPaymentDuplicateDialog", () => {
  const body: CreateCardPaymentBody = {
    fromAccountId: "account-1",
    cardId: "card-1",
    amount: 2500,
    currency: "DOP",
    transactionDate: "2026-11-11T02:30:00.000Z",
  }
  const candidate = {
    amount: "2500",
    currency: "DOP",
    transactionDate: "2026-11-10T14:30:00.000Z",
  }

  it("abre el diálogo con el cuerpo enviado y el candidato", () => {
    const dialog = nextCardPaymentDuplicateDialog(null, {
      type: "CONFLICT",
      body,
      candidate,
    })

    assert.deepEqual(dialog, { body, candidate })
  })

  it("conserva el candidato cuando el segundo POST falla", () => {
    const dialog = nextCardPaymentDuplicateDialog(null, {
      type: "CONFLICT",
      body,
      candidate,
    })

    const afterFailure = nextCardPaymentDuplicateDialog(dialog, {
      type: "ACKNOWLEDGEMENT_FAILED",
    })

    assert.equal(afterFailure, dialog)
    assert.deepEqual(afterFailure, { body, candidate })
  })

  it("cierra el diálogo al cancelar sin reenviar", () => {
    const dialog: CardPaymentDuplicateDialog = { body, candidate }

    assert.equal(
      nextCardPaymentDuplicateDialog(dialog, { type: "CANCELLED" }),
      null
    )
  })

  it("cierra el diálogo cuando el pago confirmado se guarda", () => {
    const dialog: CardPaymentDuplicateDialog = { body, candidate }

    assert.equal(
      nextCardPaymentDuplicateDialog(dialog, { type: "CONFIRMED" }),
      null
    )
  })
})
