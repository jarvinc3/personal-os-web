import {
  importReviewAmountLabel,
  importReviewMovementLabel,
  importReviewReasonLabel,
  importReviewReceivedLabel,
  importReviewRows,
} from "@/src/modules/finance/imports-review/lib/import-review-view"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { ImportReviewItem } from "@/src/modules/finance/shared/types/entities"
import { CircleAlertIcon, MailOpenIcon } from "lucide-react"
import { Fragment } from "react"

type ImportReviewCardProps = {
  item: ImportReviewItem
  display: FinanceMoneyDisplay
}

/**
 * Un correo que no se pudo importar: primero el movimiento detectado, después
 * el motivo de la revisión y solo los datos que el candidato trae.
 */
export function ImportReviewCard({ item, display }: ImportReviewCardProps) {
  const amount = importReviewAmountLabel(item.candidate, display)
  const movement = importReviewMovementLabel(item.candidate.movementClass)
  const rows = importReviewRows(item.candidate, display)
  const received = importReviewReceivedLabel(item.createdAt, display.locale)

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <MailOpenIcon
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">
            {movement ?? "Movimiento del correo"}
          </span>
          {amount ? (
            <span className="truncate text-xs text-muted-foreground">
              {amount}
            </span>
          ) : null}
        </div>
      </div>

      <p className="flex items-start gap-1.5 rounded-xl bg-muted/60 p-2 text-xs">
        <CircleAlertIcon
          className="mt-0.5 size-3.5 shrink-0 text-warning"
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          {importReviewReasonLabel(item.reviewReason)}
        </span>
      </p>

      {rows.length > 0 ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {rows.map((row) => (
            <Fragment key={row.label}>
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 truncate text-right">{row.value}</dd>
            </Fragment>
          ))}
        </dl>
      ) : null}

      {received ? (
        <span className="text-xs text-muted-foreground">{received}</span>
      ) : null}
    </div>
  )
}
