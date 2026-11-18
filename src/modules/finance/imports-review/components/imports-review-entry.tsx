"use client"

import { useImportReviewQueue } from "@/src/modules/finance/imports-review/hooks/use-import-review-queue"
import { isImportReviewEndpointUnavailable } from "@/src/modules/finance/imports-review/lib/import-review-view"
import { countLabel } from "@/src/modules/finance/shared/lib/count-label"
import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { MailWarningIcon } from "lucide-react"

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
    <SummaryItem
      title="Imports del correo"
      description={
        pending > 0
          ? `${countLabel(pending, "import")} esperando una decisión`
          : "Revisa los correos que no se pudieron importar"
      }
      icon={MailWarningIcon}
      href={APP_ROUTES.app.financeImportsReview}
      value={pending > 0 ? pending : undefined}
      showChevron
      className="px-3"
    />
  )
}
