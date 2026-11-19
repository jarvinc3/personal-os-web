import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  emailSignalId,
  evidenceRuleLabel,
  formatSignalConfidence,
  missingSignalState,
  signalRouteRows,
  signalStatusLabel,
  signalTypeLabel,
} from "@/src/modules/intelligence/signals"
import type { EmailSignal } from "@/src/modules/intelligence/types/signal.types"

function emailSignal(overrides: Partial<EmailSignal> = {}): EmailSignal {
  return {
    id: "email-3f9a1c7e",
    type: "FINANCE.TRANSACTION_DETECTED",
    domain: "FINANCE",
    status: "ROUTED",
    sourceType: "EMAIL_MESSAGE",
    sourceId: "3f9a1c7e",
    payload: {
      relevance: true,
      semanticType: "FIN_TRANSACTION",
      confidence: 0.92,
      routes: ["FINANCE"],
      messageId: "3f9a1c7e",
    },
    correlationKey: "user-1:email:3f9a1c7e",
    occurredAt: "2026-11-01T10:00:00.000Z",
    detectedAt: "2026-11-01T10:00:05.000Z",
    confidence: 0.92,
    evidence: [],
    ...overrides,
  }
}

describe("id de la señal del correo", () => {
  it("antepone email- al id del mensaje, como lo nombra el back", () => {
    assert.equal(emailSignalId("3f9a1c7e"), "email-3f9a1c7e")
  })

  it("conserva el id completo del mensaje", () => {
    const messageId = "3f9a1c7e-2b44-4d1a-9c1e-7a0d0f6b2c11"

    assert.equal(emailSignalId(messageId), `email-${messageId}`)
  })
})

describe("etiquetas de la señal", () => {
  it("traduce el tipo conocido y deja el resto tal cual", () => {
    assert.equal(
      signalTypeLabel("FINANCE.TRANSACTION_DETECTED"),
      "Transacción detectada en Finanzas"
    )
    assert.equal(
      signalTypeLabel("CALENDAR.EVENT_DETECTED"),
      "CALENDAR.EVENT_DETECTED"
    )
  })

  it("traduce cada estado del contrato", () => {
    assert.equal(signalStatusLabel("ROUTED"), "Enrutada")
    assert.equal(signalStatusLabel("DISMISSED"), "Descartada")
  })

  it("muestra la confianza en porcentaje y avisa cuando falta", () => {
    assert.equal(formatSignalConfidence(0.92), "Confianza 92%")
    assert.equal(formatSignalConfidence(0), "Confianza 0%")
    assert.equal(formatSignalConfidence(null), "Sin confianza registrada")
    assert.equal(formatSignalConfidence(undefined), "Sin confianza registrada")
  })
})

describe("rutas de la señal", () => {
  it("lista una fila por ruta con su tipo semántico", () => {
    assert.deepEqual(
      signalRouteRows(
        emailSignal({
          payload: {
            routes: ["FINANCE", "CALENDAR"],
            semanticType: "FIN_TRANSACTION",
          },
        })
      ),
      [
        {
          route: "FINANCE",
          title: "Ruta Finanzas",
          description: "Tipo: Transacción",
        },
        {
          route: "CALENDAR",
          title: "Ruta Agenda",
          description: "Tipo: Transacción",
        },
      ]
    )
  })

  it("deja la ruta cruda cuando el dominio no tiene etiqueta", () => {
    assert.deepEqual(
      signalRouteRows(
        emailSignal({ payload: { routes: ["HEALTH"], semanticType: "OTHER" } })
      ),
      [
        {
          route: "HEALTH",
          title: "Ruta HEALTH",
          description: "Tipo: Otro (requiere nota)",
        },
      ]
    )
  })

  it("no inventa rutas ni tipo cuando el payload no los trae", () => {
    assert.deepEqual(signalRouteRows(emailSignal({ payload: {} })), [])
    assert.deepEqual(
      signalRouteRows(emailSignal({ payload: { routes: ["FINANCE"] } })),
      [
        {
          route: "FINANCE",
          title: "Ruta Finanzas",
          description: "Tipo: Sin tipo",
        },
      ]
    )
  })
})

describe("evidencia de la señal", () => {
  it("nombra la regla que sostuvo la señal", () => {
    assert.equal(
      evidenceRuleLabel({
        sourceType: "EMAIL_CLASSIFICATION",
        sourceId: "3f9a1c7e",
        excerpt: {
          classificationPath: "KNOWLEDGE",
          inferenceProvider: "google",
          inferenceModel: "gemini-2.5-flash",
        },
        createdAt: "2026-11-01T10:00:05.000Z",
      }),
      "Conocimiento guardado · google gemini-2.5-flash"
    )
  })

  it("deja la ruta del clasificador cruda cuando no tiene etiqueta", () => {
    assert.equal(
      evidenceRuleLabel({
        sourceType: "EMAIL_CLASSIFICATION",
        sourceId: "3f9a1c7e",
        excerpt: { classificationPath: "HEURISTIC" },
        createdAt: "2026-11-01T10:00:05.000Z",
      }),
      "HEURISTIC"
    )
  })

  it("reconoce una evidencia sin regla", () => {
    assert.equal(
      evidenceRuleLabel({
        sourceType: "EMAIL_CLASSIFICATION",
        sourceId: "3f9a1c7e",
        excerpt: {},
        createdAt: "2026-11-01T10:00:05.000Z",
      }),
      "Sin regla registrada"
    )
  })
})

describe("estado vacío de la señal", () => {
  it("explica que la clasificación sigue pendiente", () => {
    assert.equal(missingSignalState("QUEUED").kind, "pending")
    assert.equal(missingSignalState("INGESTED").kind, "pending")
  })

  it("distingue una clasificación fallida", () => {
    assert.equal(missingSignalState("FAILED").kind, "failed")
    assert.equal(missingSignalState("FAILED").title, "La clasificación falló")
  })

  it("explica que el correo quedó descartado fuera del piloto", () => {
    assert.equal(missingSignalState("DISCARDED").kind, "discarded")
    assert.equal(missingSignalState("DISCARDED").title, "Correo descartado")
  })

  it("dice que el correo no originó señal cuando ya está clasificado", () => {
    assert.equal(missingSignalState("PROCESSED").kind, "none")
    assert.equal(missingSignalState("PROCESSED").title, "Sin señal")
    assert.equal(missingSignalState("REVIEW_REQUIRED").kind, "none")
  })
})
