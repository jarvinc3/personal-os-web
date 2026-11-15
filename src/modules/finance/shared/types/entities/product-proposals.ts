import type { FinanceCardNetwork } from "@/src/modules/finance/shared/constants/catalog"

/**
 * Producto que los correos del banco dejan como propuesta. El back no crea
 * nada hasta que el usuario lo aprueba (personal-os-back#368).
 */
export const EMAIL_PRODUCT_PROPOSAL_PRODUCT_TYPES = ["ACCOUNT", "CARD"] as const
export type EmailProductProposalProductType =
  (typeof EMAIL_PRODUCT_PROPOSAL_PRODUCT_TYPES)[number]

export const EMAIL_PRODUCT_PROPOSAL_STATUSES = [
  "PENDING",
  "APPROVING",
  "APPROVED",
  "DISCARDED",
] as const
export type EmailProductProposalStatus =
  (typeof EMAIL_PRODUCT_PROPOSAL_STATUSES)[number]

export const EMAIL_PRODUCT_PROPOSAL_ACCOUNT_TYPES = [
  "CHECKING",
  "SAVINGS",
  "INVESTMENT",
] as const
export type EmailProductProposalAccountType =
  (typeof EMAIL_PRODUCT_PROPOSAL_ACCOUNT_TYPES)[number]

export const EMAIL_PRODUCT_PROPOSAL_CARD_TYPES = ["CREDIT", "DEBIT"] as const
export type EmailProductProposalCardType =
  (typeof EMAIL_PRODUCT_PROPOSAL_CARD_TYPES)[number]

/** Los tipos de institución que el back acepta en una propuesta (sin Efectivo). */
export const EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES = [
  "bank",
  "credit_union",
  "digital_wallet",
  "broker",
  "other",
] as const
export type EmailProductProposalInstitutionType =
  (typeof EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES)[number]

export type EmailProductProposalInstitution = {
  name: string
  type: string
  domain: string | null
  country: string
  /** Institución compatible del usuario; solo cuando hay exactamente una. */
  matchedInstitutionId: string | null
  /** Todas las compatibles; dos o más indican ambigüedad. */
  matchedInstitutionIds: string[]
}

export type EmailProductProposalDraft = {
  productType: EmailProductProposalProductType
  name: string
  lastFour: string
  currency: string
  accountType: EmailProductProposalAccountType | null
  cardType: EmailProductProposalCardType | null
  network: FinanceCardNetwork | null
  accountId: string | null
  institution: EmailProductProposalInstitution
  /** El back guarda un número completo cifrado; la respuesta nunca lo trae. */
  accountNumberProvided: boolean
}

export type EmailProductProposalEvidence = {
  messageId: string
  fromDomain: string
  subject: string
  receivedAt: string
  match: Record<string, unknown>
  createdAt: string
}

export type EmailProductProposalApproval = {
  duplicate: boolean
  productId: string
  reevaluatedSignals: number
}

export type EmailProductProposal = {
  id: string
  productType: EmailProductProposalProductType
  status: EmailProductProposalStatus
  /**
   * Producto activo compatible que ya existe; se vincula con
   * `approve { productId }`. Solo cuando hay exactamente uno.
   */
  matchedProductId: string | null
  /** Productos activos compatibles; dos o más indican ambigüedad. */
  matchedProductIds: string[]
  draft: EmailProductProposalDraft
  approvedProductId: string | null
  createdAt: string
  evidence: EmailProductProposalEvidence[]
  approval?: EmailProductProposalApproval
}

export type EmailProductProposalDiscovery = {
  scanned: number
  limit: number
  limitReached: boolean
  created: number
  evidenceAdded: number
  ignored: number
  proposals: EmailProductProposal[]
}
