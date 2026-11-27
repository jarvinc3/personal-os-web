"use client"

import { useEmailProductProposals } from "@/src/modules/finance/shared/hooks/use-email-product-proposals"
import { countLabel } from "@/src/modules/finance/shared/lib/count-label"
import { isProposalEndpointUnavailable } from "@/src/modules/finance/product-proposals/lib/proposal-error"
import { DEFAULT_PROPOSAL_STATUS } from "@/src/modules/finance/product-proposals/lib/proposal-status"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { ChevronRightIcon, MailSearchIcon } from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import Link from "next/link"

type ProposalsEntryProps = {
  isEnabled: boolean
}

/**
 * Atajo de Productos a las propuestas del correo. Se esconde cuando el back no
 * tiene los endpoints (producción) para no dejar una fila que lleva a un 404.
 */
export function ProposalsEntry({ isEnabled }: ProposalsEntryProps) {
  const proposalsQuery = useEmailProductProposals(
    isEnabled,
    DEFAULT_PROPOSAL_STATUS
  )

  if (isProposalEndpointUnavailable(proposalsQuery.error)) {
    return null
  }

  const pending = proposalsQuery.data?.length ?? 0

  return (
    <Item
      variant="default"
      className={"px-3"}
      render={<Link href={APP_ROUTES.app.financeProductProposals} />}
    >
      <ItemMedia variant="icon">
        <MailSearchIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{"Detectados en correos"}</ItemTitle>
        <ItemDescription className="truncate text-xs">
          {pending > 0
            ? `${countLabel(pending, "proposal")} sin revisar`
            : "Revisa las cuentas y tarjetas que aparecen en tus correos"}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <span className="text-sm font-semibold tabular-nums">
          {pending > 0 ? pending : undefined}
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        <LinkPendingOverlay />
      </ItemActions>
    </Item>
  )
}
