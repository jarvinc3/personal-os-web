import { KNOWLEDGE_TYPE_LABELS } from "@/src/modules/intelligence/knowledge"
import { describeVerificationPayload } from "@/src/modules/intelligence/review-labels"

/** Modos de un run de análisis (`AiAnalysisRunResponseDto.mode`). */
export const ANALYSIS_RUN_MODE_LABELS = {
  ANALYZE_ONLY: "Análisis sin evaluación",
  EVALUATE: "Evaluación del conjunto",
  IMPORT: "Importación",
} as const

export const ANALYSIS_RUN_STATUS_LABELS = {
  RUNNING: "En curso",
  COMPLETED: "Completado",
  FAILED: "Fallido",
} as const

export const VERIFICATION_VERDICT_LABELS = {
  CONFIRMED: "Confirmada",
  CORRECTED: "Corregida",
  REJECTED: "Rechazada",
} as const

/** Sujeto de la frase «Corregida por …», no una etiqueta suelta. */
export const VERIFIER_ACTOR_LABELS = {
  USER: "el dueño de la cuenta",
  CONTRIBUTOR: "un colaborador",
  ADMIN: "un administrador",
} as const

export const KNOWLEDGE_SCOPE_LABELS = {
  GLOBAL: "Global, sin datos personales",
  USER: "Solo de tu cuenta",
} as const

const OBSERVATION_TYPE_LABELS: Record<string, string> = {
  ...KNOWLEDGE_TYPE_LABELS,
  EMAIL_CLASSIFICATION: "Clasificación del correo",
}

function labelFrom(labels: Record<string, string>, code: string): string {
  return labels[code] ?? code
}

export function analysisRunModeLabel(mode: string): string {
  return labelFrom(ANALYSIS_RUN_MODE_LABELS, mode)
}

export function analysisRunStatusLabel(status: string): string {
  return labelFrom(ANALYSIS_RUN_STATUS_LABELS, status)
}

export function verificationVerdictLabel(verdict: string): string {
  return labelFrom(VERIFICATION_VERDICT_LABELS, verdict)
}

export function verifierActorLabel(verifierRole: string): string {
  return labelFrom(VERIFIER_ACTOR_LABELS, verifierRole)
}

export function knowledgeScopeLabel(scope: string): string {
  return labelFrom(KNOWLEDGE_SCOPE_LABELS, scope)
}

export function observationTypeLabel(knowledgeType: string): string {
  return labelFrom(OBSERVATION_TYPE_LABELS, knowledgeType)
}

/** La verificación más reciente por secuencia: es la que manda en el resumen. */
export function latestVerification<T extends { sequence: string }>(
  verifications: readonly T[]
): T | undefined {
  return verifications.reduce<T | undefined>((latest, verification) => {
    if (!latest) {
      return verification
    }
    return Number(verification.sequence) > Number(latest.sequence)
      ? verification
      : latest
  }, undefined)
}

/**
 * Una verificación en palabras: quién la hizo, qué etiquetas dejó y de dónde
 * salió. La clasificación del correo se muestra aparte, para no confundir la
 * propuesta del modelo con la decisión de una persona.
 */
export function describeVerification({
  verdict,
  verifierRole,
  isGroundTruth,
  notes,
  correctedPayload,
}: {
  verdict: string
  verifierRole: string
  isGroundTruth: boolean
  notes: string | null
  correctedPayload: unknown
}): string {
  const parts = [
    `${verificationVerdictLabel(verdict)} por ${verifierActorLabel(verifierRole)}`,
    describeVerificationPayload(correctedPayload),
  ]
  if (isGroundTruth) {
    parts.push("verdad de referencia del conjunto de prueba")
  }
  if (notes) {
    parts.push(notes)
  }
  return parts.join(" · ")
}
