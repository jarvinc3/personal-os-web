import { ApiError } from "@/src/config/api-client"
import { ERROR_MESSAGES } from "@/src/shared/lib/error-messages"

import { translateFinanceError } from "./finance-error-messages"

export function financeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return translateFinanceError(error.status, error.message, error.code)
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return ERROR_MESSAGES.action
}

export function financeLoadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status >= 500) {
    return ERROR_MESSAGES.connection
  }
  return financeErrorMessage(error)
}
