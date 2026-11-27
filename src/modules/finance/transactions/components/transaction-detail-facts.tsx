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
import { Card } from "@/src/shared/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/src/shared/components/ui/item"

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
  const amountLabel = formatFinanceMoney(tx.amount, {
    ...display,
    currency: tx.currency,
  })
  const signedAmount =
    tx.type === "ADJUSTMENT"
      ? `${movementSign(tx) ?? ""} ${amountLabel}`.trim()
      : amountLabel
  const facts = [
    { key: "amount", title: "Monto", value: signedAmount },
    ...(isTransferTransaction(tx) && tx.transferToAmount
      ? [
          {
            key: "received",
            title: "Monto recibido",
            value: formatFinanceMoney(tx.transferToAmount, {
              ...display,
              currency: tx.transferToCurrency ?? tx.currency,
            }),
          },
        ]
      : []),
    {
      key: "base",
      title: "En moneda base",
      value: formatFinanceMoney(tx.amountBaseCurrency, display),
    },
    { key: "type", title: "Tipo", value: transactionTypeLabel(tx.type) },
    {
      key: "status",
      title: "Estado",
      value: FINANCE_TRANSACTION_STATUS_LABEL[tx.status] ?? tx.status,
    },
  ]

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Detalle
      </h2>
      <Card className="gap-0 bg-card p-1">
        {facts.map(({ key, title, value }) => (
          <Item
            key={key}
            variant="plain"
            className="border-b border-border/60 px-3 py-2"
          >
            <ItemContent>
              <ItemTitle>{title}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <span className="text-sm font-semibold tabular-nums">
                {value}
              </span>
            </ItemActions>
          </Item>
        ))}
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
              <Item
                variant="plain"
                className="border-b border-border/60 px-3 py-2"
              >
                <ItemContent>
                  <ItemTitle>Categoría</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="text-sm font-semibold tabular-nums">
                    Sin categoría
                  </span>
                </ItemActions>
              </Item>
            )}
            {account ? (
              <AccountProductRow
                account={account}
                display={display}
                variant="compact"
              />
            ) : tx.accountName ? (
              <Item
                variant="plain"
                className="border-b border-border/60 px-3 py-2"
              >
                <ItemContent>
                  <ItemTitle>Cuenta</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="text-sm font-semibold tabular-nums">
                    {tx.accountName}
                  </span>
                </ItemActions>
              </Item>
            ) : null}
            {card ? (
              <CardProductRow
                card={card}
                accounts={accounts}
                display={display}
                variant="compact"
              />
            ) : tx.cardName ? (
              <Item
                variant="plain"
                className="border-b border-border/60 px-3 py-2"
              >
                <ItemContent>
                  <ItemTitle>Tarjeta</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="text-sm font-semibold tabular-nums">
                    {tx.cardName}
                  </span>
                </ItemActions>
              </Item>
            ) : null}
            {merchant ? (
              <MerchantCard
                merchant={merchant}
                category={merchantCategory}
                display={display}
                variant="compact"
                href={APP_ROUTES.app.financeMerchant(merchant.id)}
              />
            ) : (
              <Item
                variant="plain"
                className="border-b border-border/60 px-3 py-2"
              >
                <ItemContent>
                  <ItemTitle>Comercio</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="text-sm font-semibold tabular-nums">
                    {tx.merchant ?? tx.merchantName ?? "Sin comercio"}
                  </span>
                </ItemActions>
              </Item>
            )}
          </>
        )}
        <Item variant="plain" className="px-3 py-2">
          <ItemContent>
            <ItemTitle>Descripción</ItemTitle>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {tx.description ?? "—"}
            </span>
          </ItemActions>
        </Item>
      </Card>
    </section>
  )
}
