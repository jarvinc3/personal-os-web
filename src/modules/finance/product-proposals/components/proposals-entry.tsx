"use client"

import { useEmailProductProposals } from "@/src/modules/finance/shared/hooks/use-email-product-proposals"
import { countLabel } from "@/src/modules/finance/shared/lib/count-label"
import { isProposalEndpointUnavailable } from "@/src/modules/finance/product-proposals/lib/proposal-error"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { MailSearchIcon } from "lucide-react"

type ProposalsEntryProps = {
  isEnabled: boolean
}

/**
 * Atajo de Productos a las propuestas del correo. Se esconde cuando el back no
 * tiene los endpoints (producción) para no dejar una fila que lleva a un 404.
 */
export function ProposalsEntry({ isEnabled }: ProposalsEntryProps) {
  const proposalsQuery = useEmailProductProposals(isEnabled, "PENDING")

  if (isProposalEndpointUnavailable(proposalsQuery.error)) {
    return null
  }

  const pending = proposalsQuery.data?.length ?? 0

  return (
    <SummaryItem
      title="Detectados en correos"
      description={
        pending > 0
          ? `${countLabel(pending, "proposal")} sin revisar`
          : "Revisa las cuentas y tarjetas que aparecen en tus correos"
      }
      icon={MailSearchIcon}
      href={APP_ROUTES.app.financeProductProposals}
      value={pending > 0 ? pending : undefined}
      showChevron
      className="px-3"
    />
  )
}
