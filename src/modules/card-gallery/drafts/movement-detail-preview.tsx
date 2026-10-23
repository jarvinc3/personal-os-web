"use client"

import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { formatFinanceDateTimeLabel } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { signedAmount } from "@/src/modules/finance/shared/lib/transactions-query"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceCategory,
  FinanceMerchant,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { FINANCE_TRANSACTION_STATUS_LABEL } from "@/src/modules/finance/shared/types/entities"
import { MerchantCard } from "@/src/modules/card-gallery/drafts/merchant-card"
import { Badge } from "@/src/shared/components/ui/badge"

type MovementDetailPreviewProps = {
  transaction: FinanceTransaction
  category: FinanceCategory
  account: FinanceAccount
  card: FinanceCard
  merchant: FinanceMerchant
  accounts: readonly FinanceAccount[]
  display: FinanceMoneyDisplay
  onPress: () => void
}

function ProductLabel({ children }: { children: string }) {
  return (
    <span className="px-1 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
      {children}
    </span>
  )
}

/** Composición propuesta del detalle de movimiento; definitiva en #283. */
export function MovementDetailPreview({
  transaction,
  category,
  account,
  card,
  merchant,
  accounts,
  display,
  onPress,
}: MovementDetailPreviewProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">
            {formatFinanceDateTimeLabel(
              transaction.transactionDate,
              display.locale
            )}
          </p>
          <Badge variant="info">
            {FINANCE_TRANSACTION_STATUS_LABEL[transaction.status]}
          </Badge>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {signedAmount({ transaction, display })}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {transaction.description ?? "Movimiento"}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <ProductLabel>Categoría</ProductLabel>
        <CategoryCard
          name={category.name}
          icon={category.icon}
          color={category.color}
          isSystem={category.isSystem}
          variant="chip"
          onPress={onPress}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <ProductLabel>Cuenta</ProductLabel>
        <AccountProductRow
          account={account}
          display={display}
          variant="compact"
          onPress={onPress}
        />
        <ProductLabel>Tarjeta</ProductLabel>
        <CardProductRow
          card={card}
          accounts={accounts}
          display={display}
          variant="compact"
          onPress={onPress}
        />
        <ProductLabel>Comercio</ProductLabel>
        <MerchantCard
          name={merchant.name}
          logoUrl={merchant.logoUrl}
          alias={merchant.aliases[0]}
          category={{
            name: category.name,
            icon: category.icon,
            color: category.color,
          }}
          spendLabel={formatFinanceMoney(merchant.monthSpend, display)}
          movementsLabel={`${merchant.monthMovements} movimientos`}
          variant="compact"
          onPress={onPress}
        />
      </div>
    </div>
  )
}
