import type { components } from "@/src/config/api-contract/api-schema"

type SignalSchemas = components["schemas"]

/** Señal de correo que publica la inteligencia (AI-7), tal como la describe el contrato. */
export type EmailSignal = Omit<
  SignalSchemas["AiSignalResponseDto"],
  "payload"
> & {
  payload: Record<string, unknown>
}
export type EmailSignalStatus = EmailSignal["status"]
export type EmailSignalEvidence = Omit<
  SignalSchemas["AiSignalEvidenceResponseDto"],
  "excerpt"
> & {
  excerpt: Record<string, unknown>
}
