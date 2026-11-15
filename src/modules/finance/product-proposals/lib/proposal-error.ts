import { ApiError } from "@/src/config/api-client.utils"

const NOT_FOUND_STATUS = 404

/**
 * El back responde 404 cuando las propuestas de correo no existen en ese
 * entorno (producción) y también si el endpoint todavía no está desplegado.
 */
export function isProposalEndpointUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === NOT_FOUND_STATUS
}
