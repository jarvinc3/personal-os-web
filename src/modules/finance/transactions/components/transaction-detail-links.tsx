"use client"

import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { isTransferTransaction } from "@/src/modules/finance/shared/lib/transactions-query"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import {
  CopyIcon,
  GitMergeIcon,
  LinkIcon,
  TargetIcon,
  UnlinkIcon,
  XIcon,
} from "lucide-react"

type TransactionDetailLinksProps = {
  transaction: FinanceTransaction
  merging: boolean
  markingNotDuplicate: boolean
  unlinking: boolean
  onOpenMerge: () => void
  onMarkNotDuplicate: () => void
  onOpenLink: () => void
  onOpenUnlink: () => void
}

export function TransactionDetailLinks({
  transaction,
  merging,
  markingNotDuplicate,
  unlinking,
  onOpenMerge,
  onMarkNotDuplicate,
  onOpenLink,
  onOpenUnlink,
}: TransactionDetailLinksProps) {
  return (
    <>
      {transaction.possibleDuplicateOfId ? (
        <div className="mx-4 mb-3">
          <SummarySection title="¿Duplicado?" icon={CopyIcon}>
            <p className="px-1 text-sm text-muted-foreground">
              Puede ser el mismo hecho que otro movimiento.
            </p>
            <div className="flex gap-2 px-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={merging}
                onClick={onOpenMerge}
              >
                <GitMergeIcon className="size-4 shrink-0" />
                Unir
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={markingNotDuplicate}
                onClick={onMarkNotDuplicate}
              >
                <XIcon className="size-4 shrink-0" />
                No es duplicado
              </Button>
            </div>
          </SummarySection>
        </div>
      ) : null}

      {!isTransferTransaction(transaction) ? (
        <div className="mx-4 mb-3">
          <SummarySection title="Planificación" icon={TargetIcon}>
            {transaction.planningLink ? (
              <>
                <p className="px-1 text-sm font-medium">
                  {transaction.planningLink.label}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  disabled={unlinking}
                  onClick={onOpenUnlink}
                >
                  <UnlinkIcon className="size-4 shrink-0" />
                  Quitar vínculo
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={onOpenLink}
              >
                <LinkIcon className="size-4 shrink-0" />
                Vincular a cuota, cobro o meta
              </Button>
            )}
          </SummarySection>
        </div>
      ) : null}
    </>
  )
}
