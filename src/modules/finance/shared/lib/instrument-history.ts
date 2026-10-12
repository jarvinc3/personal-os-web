import type { FinanceInstrumentHistoryItem } from "@/src/modules/finance/shared/types/entities"

export function instrumentHistoryLabel(
  item: FinanceInstrumentHistoryItem
): string {
  if (item.kind === "CREDIT_LIMIT_CHANGED") {
    return "Cambio de límite"
  }
  if (item.kind === "ADJUSTMENT") {
    return "Ajuste de saldo"
  }
  if (item.kind === "STATEMENT_CLOSED") {
    return "Corte cerrado"
  }
  return item.kind
}

export function instrumentHistoryLimitTransition(
  item: FinanceInstrumentHistoryItem
): string | null {
  if (item.kind !== "CREDIT_LIMIT_CHANGED") {
    return null
  }
  const previousLimit = item.payload.previousLimit
  const nextLimit = item.payload.nextLimit
  if (typeof nextLimit !== "number" && typeof nextLimit !== "string") {
    return null
  }
  if (previousLimit === null || previousLimit === undefined) {
    return `Límite inicial: ${nextLimit}`
  }
  return `${previousLimit} → ${nextLimit}`
}
