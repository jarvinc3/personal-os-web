import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { transferDirectionLabel } from "@/src/modules/finance/shared/lib/transactions-query"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/src/shared/components/ui/item"

import {
  crossCurrencyRate,
  transferRateLabel,
} from "@/src/modules/finance/transactions/lib/transfer-fx"

function TransferFact({ title, value }: { title: string; value: string }) {
  return (
    <Item variant="plain" className="border-b border-border/60 px-3 py-2">
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
      </ItemContent>
      <ItemActions>
        <span className="text-sm font-semibold tabular-nums">{value}</span>
      </ItemActions>
    </Item>
  )
}

type TransactionTransferDetailsProps = {
  transaction: FinanceTransaction
  accounts: readonly FinanceAccount[]
  cards: readonly FinanceCard[]
  display: FinanceMoneyDisplay
}

export function TransactionTransferDetails({
  transaction,
  accounts,
  cards,
  display,
}: TransactionTransferDetailsProps) {
  const formatLocale = useFormatLocale()
  const crossRate = crossCurrencyRate(transaction)
  const originAccount = transaction.accountId
    ? (accounts.find((item) => item.id === transaction.accountId) ?? null)
    : null
  const originCard = transaction.cardId
    ? (cards.find((item) => item.id === transaction.cardId) ?? null)
    : null
  const destinationAccount = transaction.transferToAccountId
    ? (accounts.find((item) => item.id === transaction.transferToAccountId) ??
      null)
    : null
  const destinationCard = transaction.transferToCardId
    ? (cards.find((item) => item.id === transaction.transferToCardId) ?? null)
    : null

  return (
    <>
      {originCard ? (
        <CardProductRow
          card={originCard}
          accounts={accounts}
          display={display}
          variant="compact"
        />
      ) : originAccount ? (
        <AccountProductRow
          account={originAccount}
          display={display}
          variant="compact"
        />
      ) : (
        <TransferFact
          title="Origen"
          value={transaction.accountName ?? transaction.cardName ?? "—"}
        />
      )}
      {destinationCard ? (
        <CardProductRow
          card={destinationCard}
          accounts={accounts}
          display={display}
          variant="compact"
        />
      ) : destinationAccount ? (
        <AccountProductRow
          account={destinationAccount}
          display={display}
          variant="compact"
        />
      ) : (
        <TransferFact
          title="Destino"
          value={
            transaction.transferToAccountName ??
            transaction.transferToCardName ??
            "—"
          }
        />
      )}
      <TransferFact title="Ruta" value={transferDirectionLabel(transaction)} />
      {crossRate ? (
        <TransferFact
          title={transaction.transferEstimated ? "Tasa estimada" : "Tasa"}
          value={transferRateLabel({ ...crossRate, locale: formatLocale })}
        />
      ) : null}
      {transaction.transferEstimated ? (
        <p className="px-1 text-xs text-muted-foreground">
          La tasa es la del día. Edita la transferencia para indicar la tasa o
          el monto que recibiste.
        </p>
      ) : null}
    </>
  )
}
