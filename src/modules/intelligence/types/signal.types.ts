import type { components } from "@/src/config/api-contract/api-schema"

type SignalSchemas = components["schemas"]

/** Señal de correo que publica la inteligencia (AI-7), tal como la describe el contrato. */
export type EmailSignal = SignalSchemas["AiSignalResponseDto"]
export type EmailSignalStatus = EmailSignal["status"]
export type EmailSignalEvidence = SignalSchemas["AiSignalEvidenceResponseDto"]
