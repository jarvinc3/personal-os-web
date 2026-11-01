import type { components } from "@/src/config/api-contract/api-schema"

type KnowledgeSchemas = components["schemas"]

/** Nombres del cliente para los tipos que publica el contrato del back. */
export type KnowledgeScope = KnowledgeSchemas["KnowledgeItemDto"]["scope"]
export type KnowledgeType =
  KnowledgeSchemas["KnowledgeItemDto"]["knowledgeType"]
export type KnowledgeState = KnowledgeSchemas["KnowledgeItemDto"]["state"]
export type KnowledgePromotedBy =
  KnowledgeSchemas["KnowledgeItemDto"]["promotedBy"]
export type KnowledgeTransaction = KnowledgeSchemas["KnowledgeTransactionDto"]
export type KnowledgeLabel = KnowledgeSchemas["KnowledgeLabelDto"]
export type KnowledgeItem = KnowledgeSchemas["KnowledgeItemDto"]
export type KnowledgeExplorer = KnowledgeSchemas["KnowledgeExplorerDto"]
export type KnowledgeDeletion = KnowledgeSchemas["KnowledgeDeletionDto"]

/**
 * El contrato publica la exportación como objetos sin esquema; el cliente solo
 * lee estos dos campos. Hueco registrado en docs/infrastructure/api-contract.md.
 */
export type KnowledgeExport = {
  exportedAt: string
  knowledge: KnowledgeItem[]
}
