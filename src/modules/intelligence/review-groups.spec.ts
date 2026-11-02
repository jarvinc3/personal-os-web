import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  buildReviewGroupVerification,
  canBatchReviewGroup,
  canCorrectReviewGroup,
  countLabel,
  pendingOutsideHoldout,
  resolveReviewGroupsSectionState,
  REVIEW_GROUP_SEMANTIC_TYPES,
  reviewGroupBatchResultLines,
  reviewGroupBatchSchema,
  reviewGroupKey,
  reviewGroupSamples,
} from "@/src/modules/intelligence/review-groups"
import type { AiReviewGroup } from "@/src/modules/intelligence/types/intelligence.types"

function reviewGroup(overrides: Partial<AiReviewGroup> = {}): AiReviewGroup {
  return {
    fromAddress: "notifications@github.com",
    templateFingerprint: "5c1e",
    total: 526,
    pending: 100,
    pendingHoldout: 9,
    sampleSubjects: ["Revisión de seguridad de <n>", "Nueva actividad"],
    sampleMessageIds: ["g0", "g1"],
    ...overrides,
  }
}

describe("grupos de revisión", () => {
  it("deja fuera los HOLDOUT al contar lo que se verifica en lote", () => {
    assert.equal(pendingOutsideHoldout(reviewGroup()), 91)
    assert.equal(
      pendingOutsideHoldout(reviewGroup({ pending: 9, pendingHoldout: 9 })),
      0
    )
    assert.equal(
      pendingOutsideHoldout(reviewGroup({ pending: 4, pendingHoldout: 9 })),
      0
    )
  })

  it("no permite lote cuando solo quedan pendientes HOLDOUT", () => {
    assert.equal(canBatchReviewGroup(reviewGroup()), true)
    assert.equal(
      canBatchReviewGroup(reviewGroup({ pending: 9, pendingHoldout: 9 })),
      false
    )
  })

  it("identifica el grupo por remitente y huella", () => {
    assert.equal(
      reviewGroupKey(reviewGroup()),
      "notifications%40github.com::5c1e"
    )
    assert.notEqual(
      reviewGroupKey(reviewGroup()),
      reviewGroupKey(reviewGroup({ templateFingerprint: "otra" }))
    )
    assert.notEqual(
      reviewGroupKey(reviewGroup({ templateFingerprint: null })),
      reviewGroupKey(reviewGroup())
    )
    assert.notEqual(
      reviewGroupKey(reviewGroup({ fromAddress: "a::b@example.com" })),
      reviewGroupKey(
        reviewGroup({ fromAddress: "a", templateFingerprint: "b@example.com" })
      )
    )
  })

  it("confirmar manda la identidad del grupo sin etiquetas", () => {
    const input = buildReviewGroupVerification({
      group: reviewGroup(),
      verdict: "CONFIRMED",
      values: {
        relevance: "relevant",
        semanticType: "TECH_NOTIFICATION",
        routes: ["FINANCE"],
      },
    })

    assert.deepEqual(input, {
      verdict: "CONFIRMED",
      fromAddress: "notifications@github.com",
      templateFingerprint: "5c1e",
    })
  })

  it("corregir manda las etiquetas elegidas y los dominios marcados", () => {
    const input = buildReviewGroupVerification({
      group: reviewGroup(),
      verdict: "CORRECTED",
      values: {
        relevance: "irrelevant",
        semanticType: "MARKETING",
        routes: ["FINANCE", "SUBSCRIPTIONS"],
      },
    })

    assert.deepEqual(input, {
      verdict: "CORRECTED",
      fromAddress: "notifications@github.com",
      templateFingerprint: "5c1e",
      relevance: false,
      semanticType: "MARKETING",
      routes: ["FINANCE", "SUBSCRIPTIONS"],
    })
  })

  it("corregir sin dominios envía la lista vacía", () => {
    const input = buildReviewGroupVerification({
      group: reviewGroup(),
      verdict: "CORRECTED",
      values: { relevance: "", semanticType: "TECH_NOTIFICATION", routes: [] },
    })

    assert.deepEqual(input.routes, [])
    assert.equal(input.relevance, undefined)
  })

  it("exige relevancia o tipo para corregir, no solo dominios", () => {
    assert.equal(
      canCorrectReviewGroup({
        relevance: "",
        semanticType: "",
        routes: ["FINANCE"],
      }),
      false
    )
    assert.equal(
      canCorrectReviewGroup({
        relevance: "relevant",
        semanticType: "",
        routes: [],
      }),
      true
    )
    assert.equal(
      canCorrectReviewGroup({
        relevance: "",
        semanticType: "SOCIAL",
        routes: [],
      }),
      true
    )
  })

  it("rechaza una corrección sin etiquetas y una relación imposible", () => {
    assert.throws(() =>
      buildReviewGroupVerification({
        group: reviewGroup(),
        verdict: "CORRECTED",
        values: { relevance: "", semanticType: "", routes: [] },
      })
    )
    assert.equal(
      canCorrectReviewGroup({
        relevance: "relevant",
        semanticType: "SECURITY_OTP",
        routes: [],
      }),
      false
    )
  })

  it("solo ofrece los tipos que el lote puede etiquetar sin datos extra", () => {
    assert.equal(REVIEW_GROUP_SEMANTIC_TYPES.length, 11)
    assert.equal(REVIEW_GROUP_SEMANTIC_TYPES.includes("OTHER"), false)
    assert.equal(REVIEW_GROUP_SEMANTIC_TYPES.includes("FIN_TRANSACTION"), false)
    assert.equal(
      reviewGroupBatchSchema.safeParse({
        relevance: "",
        semanticType: "OTHER",
        routes: [],
      }).success,
      false
    )
  })

  it("redacta el resultado del lote con verificados y HOLDOUT fuera", () => {
    assert.deepEqual(
      reviewGroupBatchResultLines({
        verified: 91,
        holdoutExcluded: 9,
        alreadyVerified: 0,
      }),
      ["91 correos verificados", "9 HOLDOUT quedan en la cola individual"]
    )
    assert.deepEqual(
      reviewGroupBatchResultLines({
        verified: 1,
        holdoutExcluded: 1,
        alreadyVerified: 2,
      }),
      [
        "1 correo verificado",
        "1 HOLDOUT queda en la cola individual",
        "2 ya estaban verificados",
      ]
    )
    assert.deepEqual(
      reviewGroupBatchResultLines({
        verified: 0,
        holdoutExcluded: 0,
        alreadyVerified: 0,
      }),
      ["No quedaban pendientes fuera de HOLDOUT"]
    )
  })

  it("concuerda el número con el sustantivo", () => {
    assert.equal(countLabel(1, "correo", "correos"), "1 correo")
    assert.equal(countLabel(0, "correo", "correos"), "0 correos")
    assert.equal(countLabel(91, "correo", "correos"), "91 correos")
  })

  it("empareja cada muestra con su correo", () => {
    assert.deepEqual(reviewGroupSamples(reviewGroup()), [
      { subject: "Revisión de seguridad de <n>", messageId: "g0" },
      { subject: "Nueva actividad", messageId: "g1" },
    ])
  })

  it("deja sin enlace la muestra cuyo id no llegó", () => {
    assert.deepEqual(
      reviewGroupSamples(reviewGroup({ sampleMessageIds: ["g0"] })),
      [
        { subject: "Revisión de seguridad de <n>", messageId: "g0" },
        { subject: "Nueva actividad", messageId: null },
      ]
    )
    assert.deepEqual(
      reviewGroupSamples(reviewGroup({ sampleMessageIds: [] })),
      [
        { subject: "Revisión de seguridad de <n>", messageId: null },
        { subject: "Nueva actividad", messageId: null },
      ]
    )
  })

  it("deja sin enlace las muestras cuando el contrato no trae los ids", () => {
    assert.deepEqual(
      reviewGroupSamples(reviewGroup({ sampleMessageIds: undefined })),
      [
        { subject: "Revisión de seguridad de <n>", messageId: null },
        { subject: "Nueva actividad", messageId: null },
      ]
    )
  })

  it("muestra el estado sin Gmail aunque la consulta siga pendiente", () => {
    assert.equal(
      resolveReviewGroupsSectionState({
        enabled: false,
        isPending: true,
        isError: true,
        groupCount: 0,
      }),
      "disconnected"
    )
  })

  it("elige carga, error, vacío y lista en ese orden", () => {
    const readyInput = {
      enabled: true,
      isPending: false,
      isError: false,
      groupCount: 0,
    }

    assert.equal(
      resolveReviewGroupsSectionState({ ...readyInput, isPending: true }),
      "loading"
    )
    assert.equal(
      resolveReviewGroupsSectionState({ ...readyInput, isError: true }),
      "error"
    )
    assert.equal(resolveReviewGroupsSectionState(readyInput), "empty")
    assert.equal(
      resolveReviewGroupsSectionState({ ...readyInput, groupCount: 2 }),
      "ready"
    )
  })
})
