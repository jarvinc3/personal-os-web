import { ApiError } from "@/src/config/api-client"

import { translateFinanceError } from "./finance-error-messages"

export function financeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return translateFinanceError(error.status, error.message, error.code)
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "No se pudo completar la acción"
}

export function financeLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status >= 500) {
    return "El servidor no respondió. Intenta de nuevo."
  }
  return financeErrorMessage(error)
}
