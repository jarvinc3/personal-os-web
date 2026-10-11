import { ApiError } from "@/src/config/api-client"

export function financeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return "No se pudo guardar. Intenta de nuevo."
    }
    return error.message
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
