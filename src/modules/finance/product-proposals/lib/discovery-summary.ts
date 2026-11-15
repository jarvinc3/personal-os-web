import { countLabel } from "@/src/modules/finance/shared/lib/count-label"
import type { EmailProductProposalDiscovery } from "@/src/modules/finance/shared/types/entities"

function proposalsFound(count: number): string {
  return `${countLabel(count, "proposal")} ${count === 1 ? "nueva" : "nuevas"}`
}

function conjunctionFor(next: string): "y" | "e" {
  const word = next.trim().toLowerCase()
  const startsWithISound = word.startsWith("i") || word.startsWith("hi")
  if (startsWithISound && !word.startsWith("hie")) {
    return "e"
  }
  return "y"
}

function joinedWithY(parts: readonly string[]): string {
  if (parts.length <= 1) {
    return parts.join("")
  }
  const last = parts.at(-1)
  if (!last) {
    return parts.join("")
  }
  return `${parts.slice(0, -1).join(", ")} ${conjunctionFor(last)} ${last}`
}

/** Frase del resultado de «Buscar en correos», sin cifras inventadas. */
export function discoverySummary(
  result: EmailProductProposalDiscovery
): string {
  const head = `Revisé ${countLabel(result.scanned, "message")}`
  const found: string[] = []
  if (result.created > 0) {
    found.push(`encontré ${proposalsFound(result.created)}`)
  }
  if (result.evidenceAdded > 0) {
    found.push(
      `sumé evidencia a ${countLabel(result.evidenceAdded, "message")}`
    )
  }
  if (result.ignored > 0) {
    found.push(
      `ignoré ${countLabel(result.ignored, "message")} sin datos de producto`
    )
  }
  if (found.length === 0) {
    return `${head} y no encontré datos de cuentas ni tarjetas.`
  }
  return `${head}, ${joinedWithY(found)}.`
}

/** Aviso cuando la búsqueda se quedó en el tope de correos. */
export function discoveryLimitNote(
  result: EmailProductProposalDiscovery
): string | null {
  if (!result.limitReached) {
    return null
  }
  return `Había más correos: se revisaron los últimos ${result.limit}.`
}
