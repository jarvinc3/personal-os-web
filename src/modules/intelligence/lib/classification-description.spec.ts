import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  classificationRouteLabel,
  classificationTypeLabel,
  describeClassification,
} from "./classification-description.ts"

describe("describeClassification", () => {
  it("joins method, confidence, relevance, provider, model, transaction and knowledge", () => {
    const description = describeClassification({
      method: "MODEL",
      confidence: 0.923,
      provider: "openai",
      model: "gpt-4.1-mini",
      label: {
        relevance: true,
        transaction: { amount: 10, currency: "USD" },
      },
      knowledgeUsed: [
        {
          scope: "PERSONAL",
          knowledgeType: "EMAIL_CLASSIFICATION",
          knowledgeKey: "merchant-rule",
        },
        null,
        "sin-forma",
      ],
    })

    assert.equal(
      description,
      "Modelo con validación · confianza 92% · relevante · openai · gpt-4.1-mini · amount: 10, currency: USD · conocimiento: PERSONAL EMAIL_CLASSIFICATION merchant-rule"
    )
  })

  it("names the knowledge and deterministic methods", () => {
    assert.match(
      describeClassification({ method: "KNOWLEDGE", confidence: 1 }),
      /^Conocimiento guardado/
    )
    assert.match(
      describeClassification({ method: "DETERMINISTIC" }),
      /^Parser determinista/
    )
  })

  it("falls back to the unknown method and confidence", () => {
    const description = describeClassification({ method: "OTRO" })

    assert.equal(
      description,
      "Método desconocido · confianza desconocida · sin conocimiento aplicado"
    )
  })

  it("marks an irrelevant label and no applied knowledge", () => {
    const description = describeClassification({
      method: "MODEL",
      confidence: 0.5,
      label: { relevance: false },
      knowledgeUsed: [],
    })

    assert.equal(
      description,
      "Modelo con validación · confianza 50% · no relevante · sin conocimiento aplicado"
    )
  })

  it("ignores a payload that is not an object", () => {
    assert.equal(
      describeClassification("no-es-clasificacion"),
      "Método desconocido · confianza desconocida · sin conocimiento aplicado"
    )
  })
})

describe("classificationRouteLabel", () => {
  it("translates a route of the contract", () => {
    assert.equal(classificationRouteLabel({ route: "FINANCE" }), "Finanzas")
  })

  it("explains the absence of a route", () => {
    assert.equal(classificationRouteLabel({ route: "NONE" }), "Sin dominio")
    assert.equal(classificationRouteLabel(null), "Sin dominio")
  })

  it("keeps a route that the labels do not know", () => {
    assert.equal(classificationRouteLabel({ route: "OTRA" }), "OTRA")
  })
})

describe("classificationTypeLabel", () => {
  it("translates a semantic type of the contract", () => {
    assert.equal(
      classificationTypeLabel({ label: { semanticType: "FIN_TRANSACTION" } }),
      "Transacción"
    )
  })

  it("keeps a semantic type that the labels do not know", () => {
    assert.equal(
      classificationTypeLabel({ label: { semanticType: "NUEVO_TIPO" } }),
      "NUEVO_TIPO"
    )
  })

  it("explains a missing label or semantic type", () => {
    assert.equal(classificationTypeLabel({}), "sin tipo")
    assert.equal(classificationTypeLabel({ label: "texto" }), "sin tipo")
    assert.equal(classificationTypeLabel({ label: {} }), "sin tipo")
  })
})
