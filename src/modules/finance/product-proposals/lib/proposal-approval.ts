import type {
  FinanceAccountType,
  FinanceCardType,
} from "@/src/modules/finance/shared/constants/catalog"
import {
  EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES,
  type EmailProductProposal,
  type EmailProductProposalInstitutionType,
  type FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"

export type ProposalApprovalStep = "institution" | "product"

export type InstitutionApprovalPrefill = {
  name: string
  type: EmailProductProposalInstitutionType
  country: string
  domain: string
}

export type AccountApprovalPrefill = {
  name: string
  type: FinanceAccountType | undefined
  currency: string
  lastFour: string
}

export type CardApprovalPrefill = {
  name: string
  type: FinanceCardType | undefined
  lastFour: string
  network: string | undefined
  accountId: string | undefined
}

/**
 * Una institución que el contrato no lista se crea como «Otro», igual que en
 * el listado de propuestas; nunca como Efectivo.
 */
export function proposalInstitutionType(
  value: string
): EmailProductProposalInstitutionType {
  return (
    EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES.find((type) => type === value) ??
    "other"
  )
}

export function institutionApprovalPrefill(
  proposal: EmailProductProposal
): InstitutionApprovalPrefill {
  const institution = proposal.draft.institution
  return {
    name: institution.name,
    type: proposalInstitutionType(institution.type),
    country: institution.country.trim().toUpperCase(),
    domain: institution.domain ?? "",
  }
}

export function accountApprovalPrefill(
  proposal: EmailProductProposal
): AccountApprovalPrefill {
  return {
    name: proposal.draft.name,
    type: proposal.draft.accountType ?? undefined,
    currency: proposal.draft.currency,
    lastFour: proposal.draft.lastFour,
  }
}

export function cardApprovalPrefill(
  proposal: EmailProductProposal
): CardApprovalPrefill {
  return {
    name: proposal.draft.name,
    type: proposal.draft.cardType ?? undefined,
    lastFour: proposal.draft.lastFour,
    network: proposal.draft.network ?? undefined,
    accountId: proposal.draft.accountId ?? undefined,
  }
}

/**
 * La institución compatible se reutiliza aunque esté archivada: crear otra
 * duplicaría la que el usuario ya tiene.
 */
export function initialInstitutionId({
  proposal,
  institutions,
}: {
  proposal: EmailProductProposal
  institutions: readonly FinanceInstitution[]
}): string | null {
  const matched = proposal.draft.institution.matchedInstitutionId
  if (!matched) {
    return null
  }
  return institutions.some((institution) => institution.id === matched)
    ? matched
    : null
}

/** Con la institución resuelta no hay primer paso: se abre el producto. */
export function initialApprovalStep({
  proposal,
  institutions,
}: {
  proposal: EmailProductProposal
  institutions: readonly FinanceInstitution[]
}): ProposalApprovalStep {
  return initialInstitutionId({ proposal, institutions })
    ? "product"
    : "institution"
}

/** Las cuentas primero: una tarjeta de débito necesita una cuenta. */
export function sortProposalsForReview(
  proposals: readonly EmailProductProposal[]
): EmailProductProposal[] {
  return [...proposals].sort((left, right) => {
    if (left.productType === right.productType) {
      return 0
    }
    return left.productType === "ACCOUNT" ? -1 : 1
  })
}

/** Lo que la tarjeta de la lista avisa antes de abrir el paso a paso. */
export function proposalReviewHint(
  proposal: EmailProductProposal
): string | null {
  if (proposal.productType === "CARD") {
    if (proposal.draft.cardType === "DEBIT" && !proposal.draft.accountId) {
      return "Necesita una cuenta; apruébala primero."
    }
    if (!proposal.draft.cardType) {
      return "Falta elegir el tipo."
    }
    return null
  }
  if (!proposal.draft.accountType) {
    return "Falta elegir el tipo."
  }
  return null
}
