import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  analysisRunModeLabel,
  analysisRunStatusLabel,
  describeVerification,
  knowledgeScopeLabel,
  latestBySequence,
  observationTypeLabel,
  verificationVerdictLabel,
  verifierActorLabel,
} from "./analysis-labels.ts"

describe("etiquetas de análisis", () => {
  it("traduce el modo y el estado del run", () => {
    assert.equal(analysisRunModeLabel("EVALUATE"), "Evaluación del conjunto")
    assert.equal(analysisRunModeLabel("IMPORT"), "Importación")
    assert.equal(analysisRunStatusLabel("RUNNING"), "En curso")
    assert.equal(analysisRunStatusLabel("COMPLETED"), "Completado")
  })

  it("deja el código cuando no hay etiqueta", () => {
    assert.equal(analysisRunModeLabel("OTRO"), "OTRO")
    assert.equal(analysisRunStatusLabel("OTRO"), "OTRO")
    assert.equal(verificationVerdictLabel("OTRO"), "OTRO")
    assert.equal(knowledgeScopeLabel("OTRO"), "OTRO")
  })

  it("traduce el veredicto y quién lo firmó", () => {
    assert.equal(verificationVerdictLabel("CORRECTED"), "Corregida")
    assert.equal(verifierActorLabel("USER"), "el dueño de la cuenta")
    assert.equal(verifierActorLabel("ADMIN"), "un administrador")
  })

  it("traduce el alcance y el tipo de la observación", () => {
    assert.equal(knowledgeScopeLabel("GLOBAL"), "Global, sin datos personales")
    assert.equal(
      observationTypeLabel("EMAIL_CLASSIFICATION"),
      "Clasificación del correo"
    )
    assert.equal(observationTypeLabel("EMAIL_TEMPLATE"), "Plantilla")
  })
})

describe("latestBySequence", () => {
  it("elige el registro de secuencia más alta", () => {
    const older = { sequence: "7", verdict: "CONFIRMED" }
    const newer = { sequence: "12", verdict: "CORRECTED" }

    assert.equal(latestBySequence([newer, older]), newer)
    assert.equal(latestBySequence([older, newer]), newer)
  })

  it("sin registros no hay nada que mostrar", () => {
    assert.equal(latestBySequence([]), undefined)
  })
})

describe("describeVerification", () => {
  it("dice quién decidió y con qué etiquetas", () => {
    assert.equal(
      describeVerification({
        verdict: "CORRECTED",
        verifierRole: "USER",
        isGroundTruth: false,
        notes: null,
        correctedPayload: {
          relevance: true,
          semanticType: "FIN_TRANSACTION",
          routes: ["FINANCE"],
        },
      }),
      "Corregida por el dueño de la cuenta · Relevante · Transacción · Finanzas"
    )
  })

  it("agrega la nota y la marca de verdad de referencia", () => {
    const text = describeVerification({
      verdict: "CONFIRMED",
      verifierRole: "ADMIN",
      isGroundTruth: true,
      notes: "Falta el comprobante",
      correctedPayload: null,
    })

    assert.equal(
      text,
      "Confirmada por un administrador · Sin etiquetas corregidas · verdad de referencia del conjunto de prueba · Falta el comprobante"
    )
  })
})
