import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/shared/components/brand-logo"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { transferDirectionLabel } from "@/src/modules/finance/shared/lib/transactions-query"
import { SummaryItem } from "@/src/shared/components/ui/summary"

import {
  crossCurrencyRate,
  transferRateLabel,
} from "@/src/modules/finance/transactions/lib/transfer-fx"

type TransactionTransferDetailsProps = {
  transaction: FinanceTransaction
}

export function TransactionTransferDetails({
  transaction,
}: TransactionTransferDetailsProps) {
  const crossRate = crossCurrencyRate(transaction)

  return (
    <>
      <SummaryItem
        title="Origen"
        value={transaction.accountName ?? transaction.cardName ?? "—"}
        leading={
          <span className="inline-flex items-center gap-1">
            <BrandLogo
              name={transaction.accountName ?? transaction.cardName ?? "Origen"}
              logoUrl={transaction.institutionLogoUrl}
              size={28}
            />
            {transaction.cardId ? (
              <CardNetworkMark
                network={transaction.network}
                logoUrl={transaction.networkLogoUrl}
                size={28}
              />
            ) : null}
          </span>
        }
        isLast={false}
        className="px-3"
      />
      <SummaryItem
        title="Destino"
        value={
          transaction.transferToAccountName ??
          transaction.transferToCardName ??
          "—"
        }
        leading={
          <span className="inline-flex items-center gap-1">
            <BrandLogo
              name={
                transaction.transferToAccountName ??
                transaction.transferToCardName ??
                "Destino"
              }
              logoUrl={transaction.transferToInstitutionLogoUrl}
              size={28}
            />
            {transaction.transferToCardId ? (
              <CardNetworkMark
                network={transaction.transferToNetwork}
                logoUrl={transaction.transferToNetworkLogoUrl}
                size={28}
              />
            ) : null}
          </span>
        }
        isLast={false}
        className="px-3"
      />
      <SummaryItem
        title="Ruta"
        value={transferDirectionLabel(transaction)}
        isLast={false}
        className="px-3"
      />
      {crossRate ? (
        <SummaryItem
          title={transaction.transferEstimated ? "Tasa estimada" : "Tasa"}
          value={transferRateLabel(crossRate)}
          isLast={false}
          className="px-3"
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
