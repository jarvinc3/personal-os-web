import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildReviewSelectionVerification,
  canCorrectReviewSelection,
  REVIEW_SELECTION_DEFAULTS,
  REVIEW_SELECTION_MAX_MESSAGES,
  reviewSelectionResultLines,
  toggleReviewSelection,
} from "@/src/modules/intelligence/review-selection"

describe("verificación de una selección de correos", () => {
  it("alterna correos y no supera el límite del endpoint", () => {
    assert.deepEqual(toggleReviewSelection(["a"], "b"), ["a", "b"])
    assert.deepEqual(toggleReviewSelection(["a", "b"], "a"), ["b"])
    assert.deepEqual(toggleReviewSelection(["a", "b"], "c", 2), ["a", "b"])
    assert.equal(REVIEW_SELECTION_MAX_MESSAGES, 20)
  })

  it("confirmar manda solo los ids y el veredicto", () => {
    assert.deepEqual(
      buildReviewSelectionVerification({
        messageIds: ["mail-a", "mail-b"],
        verdict: "CONFIRMED",
        values: {
          relevance: "relevant",
          semanticType: "MARKETING",
          routes: ["FINANCE"],
        },
      }),
      { messageIds: ["mail-a", "mail-b"], verdict: "CONFIRMED" }
    )
  })

  it("corregir envía las etiquetas elegidas, aunque no haya dominios", () => {
    assert.deepEqual(
      buildReviewSelectionVerification({
        messageIds: ["mail-a", "mail-b"],
        verdict: "CORRECTED",
        values: {
          relevance: "irrelevant",
          semanticType: "MARKETING",
          routes: [],
        },
      }),
      {
        messageIds: ["mail-a", "mail-b"],
        verdict: "CORRECTED",
        relevance: false,
        semanticType: "MARKETING",
        routes: [],
      }
    )
  })

  it("exige una etiqueta para corregir y valida ids únicos dentro del límite", () => {
    assert.equal(canCorrectReviewSelection(REVIEW_SELECTION_DEFAULTS), false)
    assert.throws(() =>
      buildReviewSelectionVerification({
        messageIds: ["mail-a"],
        verdict: "CORRECTED",
        values: REVIEW_SELECTION_DEFAULTS,
      })
    )
    assert.throws(() =>
      buildReviewSelectionVerification({
        messageIds: ["mail-a", "mail-a"],
        verdict: "CONFIRMED",
        values: REVIEW_SELECTION_DEFAULTS,
      })
    )
  })

  it("resume el resultado del lote", () => {
    assert.deepEqual(
      reviewSelectionResultLines({
        verified: 2,
        alreadyVerified: 1,
        requeued: 3,
      }),
      [
        "2 correos verificados",
        "1 ya estaba verificado",
        "3 correos reclasificados",
      ]
    )
  })
})
