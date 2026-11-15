import type { EmailProductProposal } from "@/src/modules/finance/shared/types/entities"

const LAST_FOUR_PATTERN = /^\d{4}$/

export type ProposalApprovalReadiness = {
  ready: boolean
  /** Lo que impide aprobar; null cuando ya se puede. */
  reason: string | null
}

/**
 * El back rechaza la aprobación de una cuenta sin tipo y de una tarjeta sin
 * tipo; una de débito además necesita su cuenta. El botón se apaga por la misma
 * regla, antes de mandar el POST.
 */
export function proposalApprovalReadiness(
  proposal: EmailProductProposal
): ProposalApprovalReadiness {
  if (proposal.status !== "PENDING") {
    return { ready: false, reason: "La propuesta ya está resuelta" }
  }
  if (!LAST_FOUR_PATTERN.test(proposal.draft.lastFour.trim())) {
    return { ready: false, reason: "Faltan los últimos 4 dígitos" }
  }
  if (proposal.productType === "ACCOUNT") {
    if (!proposal.draft.accountType) {
      return { ready: false, reason: "Elige el tipo de cuenta" }
    }
    return { ready: true, reason: null }
  }
  if (!proposal.draft.cardType) {
    return { ready: false, reason: "Elige el tipo de tarjeta" }
  }
  if (proposal.draft.cardType === "DEBIT" && !proposal.draft.accountId) {
    return { ready: false, reason: "Asocia la cuenta de la tarjeta" }
  }
  return { ready: true, reason: null }
}
