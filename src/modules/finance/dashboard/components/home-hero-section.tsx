"use client"

import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useAnalyticsSummary } from "@/src/modules/finance/shared/hooks/use-analytics"
import { useBalanceSheet } from "@/src/modules/finance/shared/hooks/use-balance-sheet"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useTransactions } from "@/src/modules/finance/shared/hooks/use-transactions"
import { financeDashboardRange } from "@/src/modules/finance/shared/lib/dashboard-period"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import { sumDecimals } from "@/src/modules/finance/shared/lib/decimal"
import {
  APP_ROUTES,
  financeTransactionNewHref,
} from "@/src/shared/constants/app-routes"
import { useCallback, useMemo, useState } from "react"
import { FinanceHomeHero } from "@/src/modules/finance/dashboard/components/home-hero"

export function FinanceHomeHeroSection() {
  const { isEnabled, config } = useFinanceEnabled()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  )
  const range = useMemo(
    () => financeDashboardRange(config.dashboardPeriod, config.weekStartsOn),
    [config.dashboardPeriod, config.weekStartsOn]
  )
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const summaryQuery = useAnalyticsSummary(isEnabled, range)
  const balanceSheetQuery = useBalanceSheet(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const pendingTransactionsQuery = useTransactions(isEnabled, {
    status: "PENDING",
    limit: 50,
  })

  const moneyDisplay = {
    ...display,
    currency:
      balanceSheetQuery.data?.baseCurrency ??
      summaryQuery.data?.baseCurrency ??
      display.currency,
  }

  const accounts = useMemo(
    () =>
      (accountsQuery.data ?? []).filter((account) => {
        if (!account.isActive) {
          return false
        }
        const balance = parseFinanceMoney(account.balance)
        return balance !== null && balance !== 0
      }),
    [accountsQuery.data]
  )
  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  )
  const global = balanceSheetQuery.data?.global
  const homeBalance = selectedAccount
    ? {
        label: `Saldo de ${selectedAccount.name}`,
        amount: formatFinanceMoney(selectedAccount.balance, {
          ...display,
          currency: selectedAccount.currency,
        }),
      }
    : {
        label: "Patrimonio neto",
        amount:
          balanceSheetQuery.isPending && !balanceSheetQuery.data
            ? "…"
            : global?.status === "COMPLETE"
              ? formatFinanceMoney(global.netWorth, moneyDisplay)
              : "Balance incompleto",
      }
  const pendingHold = sumDecimals(
    (pendingTransactionsQuery.data?.items ?? []).map(
      (transaction) => transaction.amountBaseCurrency
    )
  )
  const pendingHoldLabel = pendingHold.gt(0)
    ? `Retenido ${formatFinanceMoney(pendingHold.toFixed(2), moneyDisplay)}`
    : undefined
  const cashFlowLabel = summaryQuery.data
    ? `Flujo ${formatFinanceMoney(summaryQuery.data.cashFlow, moneyDisplay)}`
    : undefined

  const cycleAccount = useCallback(() => {
    setSelectedAccountId((currentId) => {
      if (accounts.length === 0) {
        return null
      }
      if (!currentId) {
        return accounts[0]?.id ?? null
      }
      const currentIndex = accounts.findIndex(
        (account) => account.id === currentId
      )
      if (currentIndex < 0) {
        return accounts[0]?.id ?? null
      }
      return currentIndex === accounts.length - 1
        ? null
        : (accounts[currentIndex + 1]?.id ?? null)
    })
  }, [accounts])

  return (
    <>
      <FinanceHomeHero
        balanceLabel={homeBalance.label}
        balanceAmount={homeBalance.amount}
        sendHref={financeTransactionNewHref("DEBIT")}
        receiveHref={financeTransactionNewHref("CREDIT")}
        transferHref={APP_ROUTES.app.financeTransferNew}
        pendingHoldLabel={pendingHoldLabel}
        cashFlowLabel={cashFlowLabel}
        onAccountPress={cycleAccount}
      />
    </>
  )
}
