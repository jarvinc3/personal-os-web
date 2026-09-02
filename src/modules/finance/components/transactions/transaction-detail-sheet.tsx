"use client"

import { useTransaction } from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import { formatTransactionDate } from "@/src/modules/finance/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  FINANCE_TRANSACTION_TYPE_LABEL,
  type FinanceTransactionType,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { SettingsRow, SettingsSection } from "@/src/shared/components/layout/settings-section"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"

type TransactionDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string | null
  enabled: boolean
  display: FinanceMoneyDisplay
}

function typeLabel(type: string): string {
  if (type in FINANCE_TRANSACTION_TYPE_LABEL) {
    return FINANCE_TRANSACTION_TYPE_LABEL[type as FinanceTransactionType]
  }
  return type
}

export function TransactionDetailSheet({
  open,
  onOpenChange,
  transactionId,
  enabled,
  display,
}: TransactionDetailSheetProps) {
  const detailQuery = useTransaction(enabled && open, transactionId)
  const tx = detailQuery.data

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Movimiento"
      description={tx ? formatTransactionDate(tx.transactionDate) : undefined}
      actions={{
        close: (
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        ),
      }}
    >
      {detailQuery.isPending ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : detailQuery.isError ? (
        <p className="text-sm text-destructive">
          {financeErrorMessage(detailQuery.error)}
        </p>
      ) : tx ? (
        <SettingsSection title="Detalle">
          <SettingsRow
            label="Monto"
            value={formatFinanceMoney(tx.amount, {
              ...display,
              currency: tx.currency,
            })}
            isLast={false}
          />
          <SettingsRow
            label="En moneda base"
            value={formatFinanceMoney(tx.amountBaseCurrency, display)}
            isLast={false}
          />
          <SettingsRow label="Tipo" value={typeLabel(tx.type)} isLast={false} />
          <SettingsRow
            label="Estado"
            value={FINANCE_TRANSACTION_STATUS_LABEL[tx.status] ?? tx.status}
            isLast={false}
          />
          <SettingsRow
            label="Cuenta"
            value={tx.accountName ?? "—"}
            isLast={false}
          />
          <SettingsRow
            label="Tarjeta"
            value={tx.cardName ?? "—"}
            isLast={false}
          />
          <SettingsRow label="Comercio" value={tx.merchant ?? "—"} isLast={false} />
          <SettingsRow
            label="Descripción"
            value={tx.description ?? "—"}
            isLast
          />
        </SettingsSection>
      ) : null}
    </BottomSheet>
  )
}
