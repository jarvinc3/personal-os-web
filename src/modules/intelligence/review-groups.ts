import { z } from "zod"
import {
  SEMANTIC_ROUTES,
  SEMANTIC_TYPES,
  type SemanticType,
} from "@/src/modules/intelligence/review-labels"
import type {
  AiReviewGroup,
  AiReviewGroupVerdict,
  AiReviewGroupVerificationInput,
  AiReviewGroupVerificationResult,
} from "@/src/modules/intelligence/types/intelligence.types"

/** Página del contrato de grupos; el back acepta hasta 100. */
export const REVIEW_GROUPS_PAGE_SIZE = 20

/** «Otro» pide nota y «Transacción» pide tipo: esos dos se revisan uno a uno. */
export type ReviewGroupSemanticType = Exclude<
  SemanticType,
  "OTHER" | "FIN_TRANSACTION"
>

export const REVIEW_GROUP_SEMANTIC_TYPES: ReviewGroupSemanticType[] =
  SEMANTIC_TYPES.filter(
    (semanticType): semanticType is ReviewGroupSemanticType =>
      semanticType !== "OTHER" && semanticType !== "FIN_TRANSACTION"
  )

export const reviewGroupBatchSchema = z
  .object({
    relevance: z.enum(["", "relevant", "irrelevant"]),
    semanticType: z.enum(REVIEW_GROUP_SEMANTIC_TYPES).or(z.literal("")),
    routes: z.array(z.enum(SEMANTIC_ROUTES)),
  })
  .superRefine((value, context) => {
    if (
      value.semanticType === "SECURITY_ALERT" &&
      value.relevance === "irrelevant"
    ) {
      context.addIssue({
        code: "custom",
        path: ["relevance"],
        message: "Una alerta de seguridad es relevante",
      })
    }
    if (
      value.semanticType === "SECURITY_OTP" &&
      value.relevance === "relevant"
    ) {
      context.addIssue({
        code: "custom",
        path: ["relevance"],
        message: "Un código de verificación no es relevante",
      })
    }
  })

export type ReviewGroupBatchValues = z.input<typeof reviewGroupBatchSchema>

export const REVIEW_GROUP_BATCH_DEFAULTS: ReviewGroupBatchValues = {
  relevance: "",
  semanticType: "",
  routes: [],
}

type ReviewGroupIdentity = Pick<
  AiReviewGroup,
  "fromAddress" | "templateFingerprint"
>

/** Clave estable del grupo para la hoja por ruta: remitente y huella. */
export function reviewGroupKey(group: ReviewGroupIdentity): string {
  const fingerprint = group.templateFingerprint
    ? encodeURIComponent(group.templateFingerprint)
    : ""
  return `${encodeURIComponent(group.fromAddress)}::${fingerprint}`
}

export function pendingOutsideHoldout(
  group: Pick<AiReviewGroup, "pending" | "pendingHoldout">
): number {
  return Math.max(0, group.pending - group.pendingHoldout)
}

export function canBatchReviewGroup(
  group: Pick<AiReviewGroup, "pending" | "pendingHoldout">
): boolean {
  return pendingOutsideHoldout(group) > 0
}

/** El mismo criterio habilita «Corregir» y arma su cuerpo. */
export function canCorrectReviewGroup(values: ReviewGroupBatchValues): boolean {
  if (!reviewGroupBatchSchema.safeParse(values).success) {
    return false
  }
  return Boolean(values.relevance || values.semanticType)
}

type BuildReviewGroupVerificationInput = {
  group: ReviewGroupIdentity
  verdict: AiReviewGroupVerdict
  values: ReviewGroupBatchValues
}

export function buildReviewGroupVerification({
  group,
  verdict,
  values,
}: BuildReviewGroupVerificationInput): AiReviewGroupVerificationInput {
  const identity = {
    fromAddress: group.fromAddress,
    templateFingerprint: group.templateFingerprint,
  }
  if (verdict === "CONFIRMED") {
    return { verdict, ...identity }
  }
  if (!canCorrectReviewGroup(values)) {
    throw new Error("Una corrección del lote necesita relevancia o tipo")
  }
  const correction = reviewGroupBatchSchema.parse(values)
  return {
    verdict,
    ...identity,
    ...(correction.relevance
      ? { relevance: correction.relevance === "relevant" }
      : {}),
    ...(correction.semanticType
      ? { semanticType: correction.semanticType }
      : {}),
    routes: correction.routes,
  }
}

export function countLabel(
  count: number,
  singular: string,
  plural: string
): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export type ReviewGroupSample = {
  subject: string
  messageId: string | null
}

/**
 * Empareja cada asunto de muestra con su correo. Si el contrato no trae el id
 * en esa posición, el asunto se queda sin enlace en vez de abrir otro correo.
 */
export function reviewGroupSamples(group: AiReviewGroup): ReviewGroupSample[] {
  return group.sampleSubjects.map((subject, index) => ({
    subject,
    messageId: group.sampleMessageIds[index] ?? null,
  }))
}

export function reviewGroupBatchResultLines(
  result: AiReviewGroupVerificationResult
): string[] {
  const lines = [
    result.verified > 0
      ? countLabel(result.verified, "correo verificado", "correos verificados")
      : "No quedaban pendientes fuera de HOLDOUT",
  ]
  if (result.holdoutExcluded > 0) {
    lines.push(
      `${countLabel(result.holdoutExcluded, "HOLDOUT queda", "HOLDOUT quedan")} en la cola individual`
    )
  }
  if (result.alreadyVerified > 0) {
    lines.push(
      countLabel(
        result.alreadyVerified,
        "ya estaba verificado",
        "ya estaban verificados"
      )
    )
  }
  return lines
}
