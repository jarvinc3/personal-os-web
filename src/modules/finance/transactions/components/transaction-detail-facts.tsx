"use client"

import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/shared/components/brand-logo"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  isTransferTransaction,
  movementSign,
} from "@/src/modules/finance/shared/lib/transactions-query"
import { FINANCE_TRANSACTION_STATUS_LABEL } from "@/src/modules/finance/shared/types/entities"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { TransactionTransferDetails } from "@/src/modules/finance/transactions/components/transaction-transfer-details"
import { transactionTypeLabel } from "@/src/modules/finance/transactions/lib/transaction-detail"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { SummaryItem } from "@/src/shared/components/ui/summary"

type TransactionDetailFactsProps = {
  transaction: FinanceTransaction
  display: FinanceMoneyDisplay
}

export function TransactionDetailFacts({
  transaction: tx,
  display,
}: TransactionDetailFactsProps) {
  return (
    <SettingsSection title="Detalle">
      <SummaryItem
        title="Monto"
        value={
          tx.type === "ADJUSTMENT"
            ? `${movementSign(tx) ?? ""} ${formatFinanceMoney(tx.amount, {
                ...display,
                currency: tx.currency,
              })}`.trim()
            : formatFinanceMoney(tx.amount, {
                ...display,
                currency: tx.currency,
              })
        }
        isLast={false}
        className="px-3"
      />
      {isTransferTransaction(tx) && tx.transferToAmount ? (
        <SummaryItem
          title="Monto recibido"
          value={formatFinanceMoney(tx.transferToAmount, {
            ...display,
            currency: tx.transferToCurrency ?? tx.currency,
          })}
          isLast={false}
          className="px-3"
        />
      ) : null}
      <SummaryItem
        title="En moneda base"
        value={formatFinanceMoney(tx.amountBaseCurrency, display)}
        isLast={false}
        className="px-3"
      />
      <SummaryItem
        title="Tipo"
        value={transactionTypeLabel(tx.type)}
        isLast={false}
        className="px-3"
      />
      <SummaryItem
        title="Estado"
        value={FINANCE_TRANSACTION_STATUS_LABEL[tx.status] ?? tx.status}
        isLast={false}
        className="px-3"
      />
      {isTransferTransaction(tx) ? (
        <TransactionTransferDetails transaction={tx} />
      ) : (
        <>
          <SummaryItem
            title="Cuenta"
            value={tx.accountName ?? "—"}
            leading={
              tx.accountId ? (
                <BrandLogo
                  name={tx.accountName ?? "Cuenta"}
                  logoUrl={tx.institutionLogoUrl}
                  size={28}
                />
              ) : undefined
            }
            isLast={false}
            className="px-3"
          />
          <SummaryItem
            title="Tarjeta"
            value={tx.cardName ?? "—"}
            leading={
              tx.cardId ? (
                <span className="inline-flex items-center gap-1">
                  <BrandLogo
                    name={tx.cardName ?? "Tarjeta"}
                    logoUrl={tx.institutionLogoUrl}
                    size={28}
                  />
                  <CardNetworkMark
                    network={tx.network}
                    logoUrl={tx.networkLogoUrl}
                    size={28}
                  />
                </span>
              ) : undefined
            }
            isLast={false}
            className="px-3"
          />
        </>
      )}
      <SummaryItem
        title="Comercio"
        value={tx.merchant ?? tx.merchantName ?? "—"}
        leading={
          tx.merchantLogoUrl ? (
            <BrandLogo
              name={tx.merchant ?? tx.merchantName ?? "Comercio"}
              logoUrl={tx.merchantLogoUrl}
              size={28}
            />
          ) : undefined
        }
        description={tx.merchantName && tx.merchant ? tx.merchant : undefined}
        isLast={false}
        className="px-3"
      />
      <SummaryItem
        title="Descripción"
        value={tx.description ?? "—"}
        isLast
        className="px-3"
      />
    </SettingsSection>
  )
}
