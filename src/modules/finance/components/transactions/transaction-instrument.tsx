import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/components/brand-logo";
import { transactionInstrumentLabel } from "@/src/modules/finance/lib/transactions-query";
import type { FinanceTransaction } from "@/src/modules/finance/types/entities";

type TransactionInstrumentProps = {
  transaction: FinanceTransaction
}

export function TransactionInstrument({ transaction }: TransactionInstrumentProps) {
  const label = transactionInstrumentLabel(transaction)
  if (!label) return null

  const name = transaction.accountName ?? transaction.cardName ?? label

  return (
    <span className="flex w-full min-w-0 items-center gap-1.5">
      <BrandLogo
        name={name}
        logoUrl={transaction.institutionLogoUrl}
        size={16}
        className="shrink-0 text-[0.5rem]"
      />
      {transaction.cardId ? (
        <CardNetworkMark
          network={transaction.network}
          logoUrl={transaction.networkLogoUrl}
          size={16}
          className="shrink-0 text-[0.5rem]"
        />
      ) : null}
      <span className="min-w-0 truncate">{label}</span>
    </span>
  )
}
