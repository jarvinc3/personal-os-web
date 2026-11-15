import {
  EMAIL_PRODUCT_PROPOSAL_STATUSES,
  type EmailProductProposalStatus,
} from "@/src/modules/finance/shared/types/entities"

export const PROPOSAL_STATUS_QUERY_PARAM = "status"

/** Pendientes es el filtro con el que abre la vista, por eso no escribe la URL. */
export const DEFAULT_PROPOSAL_STATUS: EmailProductProposalStatus = "PENDING"

export const PROPOSAL_STATUS_LABEL: Record<EmailProductProposalStatus, string> =
  {
    PENDING: "Pendientes",
    APPROVING: "En curso",
    APPROVED: "Aprobadas",
    DISCARDED: "Descartadas",
  }

/** Una propuesta suelta se nombra en singular. */
export const PROPOSAL_STATUS_BADGE_LABEL: Record<
  EmailProductProposalStatus,
  string
> = {
  PENDING: "Pendiente",
  APPROVING: "En curso",
  APPROVED: "Aprobada",
  DISCARDED: "Descartada",
}

function isProposalStatus(
  value: string | null
): value is EmailProductProposalStatus {
  return EMAIL_PRODUCT_PROPOSAL_STATUSES.includes(
    value as EmailProductProposalStatus
  )
}

/** Un estado desconocido en la URL vuelve a pendientes. */
export function proposalStatusFromSearchParams(searchParams: {
  get: (name: string) => string | null
}): EmailProductProposalStatus {
  const value = searchParams.get(PROPOSAL_STATUS_QUERY_PARAM)
  if (!isProposalStatus(value)) {
    return DEFAULT_PROPOSAL_STATUS
  }
  return value
}

export function withProposalStatus(
  search: string,
  status: EmailProductProposalStatus
): string {
  const params = new URLSearchParams(search)
  if (status === DEFAULT_PROPOSAL_STATUS) {
    params.delete(PROPOSAL_STATUS_QUERY_PARAM)
    return params.toString()
  }
  params.set(PROPOSAL_STATUS_QUERY_PARAM, status)
  return params.toString()
}
