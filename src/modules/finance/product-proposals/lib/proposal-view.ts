import {
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_CARD_NETWORK_LABEL,
  FINANCE_CARD_TYPE_LABEL,
} from "@/src/modules/finance/shared/constants/catalog"
import type {
  EmailProductProposal,
  EmailProductProposalEvidence,
} from "@/src/modules/finance/shared/types/entities"
import { formatDate } from "@/src/shared/lib/date-format"

/** Correos que la tarjeta de una propuesta enseña antes de resumir el resto. */
export const PROPOSAL_EVIDENCE_PREVIEW = 3

const LAST_FOUR_PATTERN = /^\d{4}$/
const NO_SUBJECT_LABEL = "Correo sin asunto"

export function proposalKindLabel(
  proposal: EmailProductProposal
): "Cuenta" | "Tarjeta" {
  return proposal.productType === "ACCOUNT" ? "Cuenta" : "Tarjeta"
}

/** Tipo del producto; vacío cuando el correo no lo dijo y falta elegirlo. */
export function proposalTypeLabel(proposal: EmailProductProposal): string {
  if (proposal.productType === "ACCOUNT") {
    if (!proposal.draft.accountType) {
      return "Sin tipo"
    }
    return FINANCE_ACCOUNT_TYPE_LABEL[proposal.draft.accountType]
  }
  if (!proposal.draft.cardType) {
    return "Sin tipo"
  }
  return FINANCE_CARD_TYPE_LABEL[proposal.draft.cardType]
}

export function proposalNetworkLabel(
  proposal: EmailProductProposal
): string | null {
  if (proposal.productType !== "CARD" || !proposal.draft.network) {
    return null
  }
  return FINANCE_CARD_NETWORK_LABEL[proposal.draft.network]
}

export function proposalLastFourLabel(lastFour: string): string | null {
  const value = lastFour.trim()
  if (!LAST_FOUR_PATTERN.test(value)) {
    return null
  }
  return `•••• ${value}`
}

/** Línea corta de la card: tipo, últimos 4 y moneda o red. */
export function proposalProductDetail(proposal: EmailProductProposal): string {
  const parts = [proposalTypeLabel(proposal)]
  const lastFour = proposalLastFourLabel(proposal.draft.lastFour)
  if (lastFour) {
    parts.push(lastFour)
  }
  if (proposal.productType === "ACCOUNT") {
    const currency = proposal.draft.currency.trim().toUpperCase()
    if (currency) {
      parts.push(currency)
    }
  } else {
    const network = proposalNetworkLabel(proposal)
    if (network) {
      parts.push(network)
    }
  }
  return parts.join(" · ")
}

export type ProposalEvidenceRow = {
  messageId: string
  subject: string
  fromDomain: string
  dateLabel: string
}

/** Los correos más recientes primero, con la fecha ya formateada. */
export function proposalEvidenceRows({
  evidence,
  locale,
  limit = PROPOSAL_EVIDENCE_PREVIEW,
}: {
  evidence: readonly EmailProductProposalEvidence[]
  locale: string
  limit?: number
}): ProposalEvidenceRow[] {
  return [...evidence]
    .sort((left, right) => right.receivedAt.localeCompare(left.receivedAt))
    .slice(0, limit)
    .map((item) => ({
      messageId: item.messageId,
      subject: item.subject.trim() || NO_SUBJECT_LABEL,
      fromDomain: item.fromDomain,
      dateLabel: formatDate(item.receivedAt, locale),
    }))
}
