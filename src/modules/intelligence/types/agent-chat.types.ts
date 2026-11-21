import type { components } from "@/src/config/api-contract/api-schema"

type AiSchemas = components["schemas"]

/** Nombres del feature para los DTO de conversaciones del contrato. */
export type AgentConversationSummary = AiSchemas["AiConversationSummaryDto"]
export type AgentConversationPage = AiSchemas["AiConversationPageDto"]
export type AgentConversationDetail = AiSchemas["AiConversationDetailDto"]
export type AgentConversationMessage = AiSchemas["AiConversationMessageDto"]
export type AgentConversationCreated = AiSchemas["AiConversationCreatedDto"]
export type AgentConversationAnswer = AiSchemas["AiConversationAnswerDto"]
export type AgentConversationAction = AiSchemas["AiConversationActionDto"]
type ContractInvocationContext = AiSchemas["AiInvocationContextDto"]
type ContractInvocationEntityRef = AiSchemas["AiInvocationEntityRefDto"]

/** El contrato no enumera `institution`, aunque el back sí la resuelve. */
export type AgentInvocationEntityType =
  ContractInvocationEntityRef["type"] | "institution"

export type AgentInvocationEntityRef = {
  type: AgentInvocationEntityType
  id: string
}

export type AgentInvocationContext = Omit<
  ContractInvocationContext,
  "entityRef"
> & {
  entityRef?: AgentInvocationEntityRef
}

/** El contrato ya publica el envío; el cliente fija `stream` y el id del turno. */
export type AgentSendMessageBody = Omit<
  AiSchemas["SendAiConversationMessageDto"],
  "clientMessageId" | "stream" | "context"
> & {
  clientMessageId: string
  stream: true
  context?: AgentInvocationContext
}

export type AgentStreamEvent =
  | { type: "start"; conversationId: string }
  | { type: "status"; message: string }
  | { type: "chunk"; content: string }
  | { type: "reset" }
  | ({ type: "done" } & AgentConversationAnswer)
  | { type: "error"; message: string; code?: string }

export type AgentChatUiMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  status: "streaming" | "error" | "done"
  clientMessageId?: string
  provider?: string
  model?: string
}
