"use client"

import { useImportReviewQueue } from "@/src/modules/finance/imports-review/hooks/use-import-review-queue"
import { isImportReviewEndpointUnavailable } from "@/src/modules/finance/imports-review/lib/import-review-view"
import { countLabel } from "@/src/modules/finance/shared/lib/count-label"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { ChevronRightIcon, MailWarningIcon } from "lucide-react"
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

type ImportsReviewEntryProps = {
  isEnabled: boolean
}

/**
 * Atajo de Productos a la cola de imports del correo. Se esconde cuando el
 * entorno no tiene el endpoint desplegado para no llevar a un 404.
 */
export function ImportsReviewEntry({ isEnabled }: ImportsReviewEntryProps) {
  const queueQuery = useImportReviewQueue(isEnabled)

  if (isImportReviewEndpointUnavailable(queueQuery.error)) {
    return null
  }

  const pending = queueQuery.data?.length ?? 0

  return (
    <Item
      variant="default"
      className={"px-3"}
      render={<Link href={APP_ROUTES.app.financeImportsReview} />}
    >
      <ItemMedia variant="icon">
        <MailWarningIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{"Imports del correo"}</ItemTitle>
        <ItemDescription className="truncate text-xs">
          {pending > 0
            ? `${countLabel(pending, "import")} esperando una decisión`
            : "Revisa los correos que no se pudieron importar"}
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
