import { ApiError } from "@/src/config/api-client"

export function financeErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "No se pudo completar la acción"
}
