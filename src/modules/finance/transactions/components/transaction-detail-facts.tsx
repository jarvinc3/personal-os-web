"use client"

import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { MerchantCard } from "@/src/modules/finance/merchants/components/merchant-card"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  isTransferTransaction,
  movementSign,
} from "@/src/modules/finance/shared/lib/transactions-query"
import { FINANCE_TRANSACTION_STATUS_LABEL } from "@/src/modules/finance/shared/types/entities"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceCategory,
  FinanceMerchant,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { TransactionTransferDetails } from "@/src/modules/finance/transactions/components/transaction-transfer-details"
import { transactionTypeLabel } from "@/src/modules/finance/transactions/lib/transaction-detail"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
import { SummaryItem } from "@/src/shared/components/ui/summary"

type TransactionDetailFactsProps = {
  transaction: FinanceTransaction
  display: FinanceMoneyDisplay
  categories: readonly FinanceCategory[]
  accounts: readonly FinanceAccount[]
  cards: readonly FinanceCard[]
  account: FinanceAccount | null
  card: FinanceCard | null
  merchant: FinanceMerchant | null
}

export function TransactionDetailFacts({
  transaction: tx,
  display,
  categories,
  accounts,
  cards,
  account,
  card,
  merchant,
}: TransactionDetailFactsProps) {
  const category = tx.categoryId
    ? (categories.find((item) => item.id === tx.categoryId) ?? null)
    : null
  const merchantCategory = merchant?.categoryId
    ? (categories.find((item) => item.id === merchant.categoryId) ?? null)
    : null

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
        <TransactionTransferDetails
          transaction={tx}
          accounts={accounts}
          cards={cards}
          display={display}
        />
      ) : (
        <>
          {category ? (
            <CategoryCard
              name={category.name}
              icon={category.icon}
              color={category.color}
              isSystem={category.isSystem}
              variant="chip"
              className="px-3"
            />
          ) : (
            <SummaryItem
              title="Categoría"
              value="Sin categoría"
              isLast={false}
              className="px-3"
            />
          )}
          {account ? (
            <AccountProductRow
              account={account}
              display={display}
              variant="compact"
            />
          ) : (
            <SummaryItem
              title="Cuenta"
              value={tx.accountName ?? "Sin cuenta"}
              isLast={false}
              className="px-3"
            />
          )}
          {card ? (
            <CardProductRow
              card={card}
              accounts={accounts}
              display={display}
              variant="compact"
            />
          ) : (
            <SummaryItem
              title="Tarjeta"
              value={tx.cardName ?? "Sin tarjeta"}
              isLast={false}
              className="px-3"
            />
          )}
          {merchant ? (
            <MerchantCard
              merchant={merchant}
              category={merchantCategory}
              display={display}
              variant="compact"
              href={APP_ROUTES.app.financeMerchant(merchant.id)}
            />
          ) : (
            <SummaryItem
              title="Comercio"
              value={tx.merchant ?? tx.merchantName ?? "Sin comercio"}
              isLast={false}
              className="px-3"
            />
          )}
        </>
      )}
      <SummaryItem
        title="Descripción"
        value={tx.description ?? "—"}
        isLast
        className="px-3"
      />
    </SettingsSection>
  )
}
