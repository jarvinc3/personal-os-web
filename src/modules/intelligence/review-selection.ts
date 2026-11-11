import { z } from "zod"

import {
  SEMANTIC_ROUTES,
  SEMANTIC_TYPES,
  type SemanticRoute,
  type SemanticType,
} from "@/src/modules/intelligence/review-labels"
import type {
  AiReviewSelectionVerificationInput,
  AiReviewSelectionVerificationResult,
} from "@/src/modules/intelligence/types/intelligence.types"

export const REVIEW_SELECTION_MAX_MESSAGES = 20

export type ReviewSelectionSemanticType = Exclude<
  SemanticType,
  "OTHER" | "FIN_TRANSACTION"
>

export const REVIEW_SELECTION_SEMANTIC_TYPES: ReviewSelectionSemanticType[] =
  SEMANTIC_TYPES.filter(
    (type): type is ReviewSelectionSemanticType =>
      type !== "OTHER" && type !== "FIN_TRANSACTION"
  )

const reviewSelectionSchema = z
  .object({
    relevance: z.enum(["", "relevant", "irrelevant"]),
    semanticType: z.enum(REVIEW_SELECTION_SEMANTIC_TYPES).or(z.literal("")),
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

export type ReviewSelectionValues = z.input<typeof reviewSelectionSchema>

export const REVIEW_SELECTION_DEFAULTS: ReviewSelectionValues = {
  relevance: "",
  semanticType: "",
  routes: [],
}

export function toggleReviewSelection(
  selectedIds: readonly string[],
  messageId: string,
  maxMessages = REVIEW_SELECTION_MAX_MESSAGES
): string[] {
  if (selectedIds.includes(messageId)) {
    return selectedIds.filter((id) => id !== messageId)
  }
  if (selectedIds.length >= maxMessages) {
    return [...selectedIds]
  }
  return [...selectedIds, messageId]
}

export function canCorrectReviewSelection(
  values: ReviewSelectionValues
): boolean {
  if (!reviewSelectionSchema.safeParse(values).success) {
    return false
  }
  return Boolean(values.relevance || values.semanticType)
}

export function buildReviewSelectionVerification({
  messageIds,
  verdict,
  values,
}: {
  messageIds: readonly string[]
  verdict: "CONFIRMED" | "CORRECTED"
  values: ReviewSelectionValues
}): AiReviewSelectionVerificationInput {
  if (
    messageIds.length === 0 ||
    messageIds.length > REVIEW_SELECTION_MAX_MESSAGES ||
    new Set(messageIds).size !== messageIds.length
  ) {
    throw new Error("Selecciona entre 1 y 20 correos sin repetir")
  }

  const ids = [...messageIds]
  if (verdict === "CONFIRMED") {
    return { messageIds: ids, verdict }
  }
  if (!canCorrectReviewSelection(values)) {
    throw new Error("Una corrección necesita relevancia o tipo semántico")
  }

  const correction = reviewSelectionSchema.parse(values)
  return {
    messageIds: ids,
    verdict,
    ...(correction.relevance
      ? { relevance: correction.relevance === "relevant" }
      : {}),
    ...(correction.semanticType
      ? { semanticType: correction.semanticType }
      : {}),
    routes: correction.routes,
  }
}

export function reviewSelectionResultLines(
  result: AiReviewSelectionVerificationResult
): string[] {
  const lines: string[] = []
  if (result.verified > 0) {
    lines.push(
      `${result.verified} ${result.verified === 1 ? "correo verificado" : "correos verificados"}`
    )
  }
  if (result.alreadyVerified > 0) {
    lines.push(
      `${result.alreadyVerified} ${result.alreadyVerified === 1 ? "ya estaba verificado" : "ya estaban verificados"}`
    )
  }
  if (result.requeued > 0) {
    lines.push(
      `${result.requeued} ${result.requeued === 1 ? "correo reclasificado" : "correos reclasificados"}`
    )
  }
  return lines.length ? lines : ["No hubo cambios en la selección"]
}

export type { SemanticRoute }
