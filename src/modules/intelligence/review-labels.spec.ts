import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildCorrection,
  describeVerificationPayload,
  RELEVANCE_LABELS,
  REVIEW_FORM_DEFAULTS,
  reviewSelectLabel,
  reviewFormSchema,
  SEMANTIC_TYPE_LABELS,
  TRANSACTION_DIRECTION_LABELS,
  TRANSACTION_KIND_LABELS,
} from "@/src/modules/intelligence/review-labels"

describe("revisión humana de correo", () => {
  it("muestra etiquetas en los selectores cerrados", () => {
    assert.equal(
      reviewSelectLabel("irrelevant", RELEVANCE_LABELS, "Sin etiqueta"),
      "No relevante"
    )
    assert.equal(
      reviewSelectLabel("JOB", SEMANTIC_TYPE_LABELS, "Elige un tipo"),
      "Empleo"
    )
    assert.equal(
      reviewSelectLabel("PENDING", TRANSACTION_KIND_LABELS, "Elige un tipo"),
      "Pendiente"
    )
    assert.equal(
      reviewSelectLabel("DEBIT", TRANSACTION_DIRECTION_LABELS, "Sin dirección"),
      "Débito"
    )
    assert.equal(
      reviewSelectLabel("", SEMANTIC_TYPE_LABELS, "Elige un tipo"),
      "Elige un tipo"
    )
    assert.equal(
      reviewSelectLabel(null, RELEVANCE_LABELS, "Sin etiqueta"),
      "Sin etiqueta"
    )
  })

  it("ofrece los trece tipos y exige nota o kind cuando corresponde", () => {
    assert.equal(Object.keys(SEMANTIC_TYPE_LABELS).length, 13)
    assert.equal(
      reviewFormSchema.safeParse({
        ...REVIEW_FORM_DEFAULTS,
        semanticType: "OTHER",
      }).success,
      false
    )
    assert.equal(
      reviewFormSchema.safeParse({
        ...REVIEW_FORM_DEFAULTS,
        semanticType: "FIN_TRANSACTION",
      }).success,
      false
    )
  })

  it("envía dominios vacíos y una transacción tipada", () => {
    assert.deepEqual(
      buildCorrection({
        ...REVIEW_FORM_DEFAULTS,
        semanticType: "FIN_TRANSACTION",
        kind: "TRANSACTION",
        amount: "1250",
        currency: "DOP",
        direction: "DEBIT",
      }),
      {
        verdict: "CORRECTED",
        semanticType: "FIN_TRANSACTION",
        routes: [],
        transaction: {
          kind: "TRANSACTION",
          amount: 1250,
          currency: "DOP",
          direction: "DEBIT",
        },
      }
    )
  })

  it("omite kind en recibos y transacción en publicidad", () => {
    assert.equal(
      buildCorrection({
        ...REVIEW_FORM_DEFAULTS,
        semanticType: "PURCHASE_RECEIPT",
      }).transaction,
      undefined
    )
    assert.deepEqual(
      buildCorrection({
        ...REVIEW_FORM_DEFAULTS,
        semanticType: "PURCHASE_RECEIPT",
        amount: "500",
      }).transaction,
      { amount: 500 }
    )
    assert.equal(
      buildCorrection({ ...REVIEW_FORM_DEFAULTS, semanticType: "MARKETING" })
        .transaction,
      undefined
    )
  })

  it("fija relevancia de alertas de seguridad y códigos", () => {
    assert.equal(
      buildCorrection({
        ...REVIEW_FORM_DEFAULTS,
        semanticType: "SECURITY_ALERT",
      }).relevance,
      true
    )
    assert.equal(
      buildCorrection({ ...REVIEW_FORM_DEFAULTS, semanticType: "SECURITY_OTP" })
        .relevance,
      false
    )
  })

  it("muestra los nombres elegidos y la ausencia de dominios", () => {
    assert.match(
      describeVerificationPayload({
        semanticType: "FIN_TRANSACTION",
        routes: [],
        transaction: {
          kind: "PENDING",
          amount: 1250,
          currency: "DOP",
          direction: "DEBIT",
        },
      }),
      /Transacción · Sin dominios · Pendiente · 1250 · DOP · Débito/
    )
  })

  it("muestra la relevancia corregida junto al resto de etiquetas", () => {
    assert.equal(describeVerificationPayload({ relevance: true }), "Relevante")
    assert.match(
      describeVerificationPayload({
        relevance: false,
        semanticType: "MARKETING",
      }),
      /^No relevante · Publicidad \/ newsletter/
    )
  })
})
