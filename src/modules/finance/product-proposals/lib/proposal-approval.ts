import type {
  FinanceAccountType,
  FinanceCardType,
} from "@/src/modules/finance/shared/constants/catalog"
import {
  EMAIL_PRODUCT_PROPOSAL_INSTITUTION_TYPES,
  type EmailProductProposal,
  type EmailProductProposalInstitutionType,
  type FinanceAccount,
  type FinanceCard,
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
 * duplicaría la que el usuario ya tiene. La lista de la web solo trae activas,
 * así que una compatibilidad ausente se reconstruye con los datos del correo.
 */
export function resolveApprovalInstitution({
  proposal,
  institutions,
}: {
  proposal: EmailProductProposal
  institutions: readonly FinanceInstitution[]
}): FinanceInstitution | null {
  const matchedId = proposal.draft.institution.matchedInstitutionId
  if (!matchedId) {
    return null
  }
  const known = institutions.find((institution) => institution.id === matchedId)
  if (known) {
    return known
  }
  const draftInstitution = proposal.draft.institution
  return {
    id: matchedId,
    name: draftInstitution.name,
    type: proposalInstitutionType(draftInstitution.type),
    shortName: null,
    domain: draftInstitution.domain,
    color: null,
    logoUrl: null,
    country: draftInstitution.country.trim().toUpperCase(),
    isActive: false,
    isSystem: false,
  }
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

export type ProposalApprovalState = {
  step: ProposalApprovalStep
  institution: FinanceInstitution | null
  createdProductId: string | null
  approvalError: string | null
}

export function initialApprovalState({
  proposal,
  institutions,
}: {
  proposal: EmailProductProposal
  institutions: readonly FinanceInstitution[]
}): ProposalApprovalState {
  const institution = resolveApprovalInstitution({ proposal, institutions })
  return {
    step: institution ? "product" : "institution",
    institution,
    createdProductId: null,
    approvalError: null,
  }
}

/** Cambiar de institución conserva lo ya escrito en los formularios nativos. */
export function chooseApprovalInstitution(
  state: ProposalApprovalState,
  institution: FinanceInstitution
): ProposalApprovalState {
  return { ...state, step: "product", institution, approvalError: null }
}

export function startApproval(
  state: ProposalApprovalState,
  productId: string
): ProposalApprovalState {
  return { ...state, createdProductId: productId, approvalError: null }
}

export function failApproval(
  state: ProposalApprovalState,
  message: string
): ProposalApprovalState {
  return { ...state, approvalError: message }
}

/** Reintentar aprueba el mismo producto: nunca se crea otro. */
export function retryProductId(state: ProposalApprovalState): string | null {
  return state.approvalError ? state.createdProductId : null
}

/**
 * Producto existente que se puede vincular: tiene que ser el del tipo de la
 * propuesta y pertenecer a la institución elegida, aunque haya varias
 * compatibles.
 */
export function matchedApprovalProduct({
  proposal,
  institutionId,
  accounts,
  cards,
}: {
  proposal: EmailProductProposal
  institutionId: string | null
  accounts: readonly FinanceAccount[]
  cards: readonly FinanceCard[]
}): {
  id: string
  account: FinanceAccount | null
  card: FinanceCard | null
} | null {
  const matchedId = proposal.matchedProductId
  if (!matchedId || !institutionId) {
    return null
  }
  if (proposal.productType === "ACCOUNT") {
    const account = accounts.find((item) => item.id === matchedId) ?? null
    return account && account.institutionId === institutionId
      ? { id: account.id, account, card: null }
      : null
  }
  const card = cards.find((item) => item.id === matchedId) ?? null
  return card && card.institutionId === institutionId
    ? { id: card.id, account: null, card }
    : null
}
