import { ExternalLinkIcon, RotateCcwIcon } from "lucide-react"

import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import { SummarySection } from "@/src/shared/components/ui/summary"

type TransactionReversalNoticeProps = {
  transaction: FinanceTransaction
  onOpenOriginal: (id: string) => void
}

export function TransactionReversalNotice({
  transaction,
  onOpenOriginal,
}: TransactionReversalNoticeProps) {
  if (transaction.status !== "REVERSED") {
    return null
  }

  return (
    <div className="mx-4 mb-3">
      <SummarySection title="Revertido" icon={RotateCcwIcon}>
        <p className="px-1 text-sm text-muted-foreground">
          {transaction.source === "EMAIL"
            ? "El banco devolvió este movimiento y el saldo volvió a su lugar."
            : "El saldo de este movimiento volvió a su lugar."}
        </p>
        {transaction.linkedTransactionId ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => onOpenOriginal(transaction.linkedTransactionId!)}
          >
            <ExternalLinkIcon className="size-4 shrink-0" />
            Ver movimiento original
          </Button>
        ) : null}
      </SummarySection>
    </div>
  )
}
