"use client"

import { useAccounts } from "@/src/modules/finance/hooks/use-accounts";
import { useAnalyticsSummary } from "@/src/modules/finance/hooks/use-analytics";
import { useCategories } from "@/src/modules/finance/hooks/use-categories";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { useTransactions } from "@/src/modules/finance/hooks/use-transactions";
import { financeDashboardRange } from "@/src/modules/finance/lib/dashboard-period";
import { deriveFrequentExpenses } from "@/src/modules/finance/lib/finance-home";
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/lib/money";
import { Button } from "@/src/shared/components/ui/button";
import { SummarySection } from "@/src/shared/components/ui/summary";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import {
  ArrowRight,
  BarChart3Icon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FinanceHomeHero } from "./finance-home-hero";
import {
  FrequentExpensesSection,
  RecentTransactionsSection,
} from "./finance-home-sections";

export function FinanceOverview() {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const range = useMemo(
    () => financeDashboardRange(config.dashboardPeriod, config.weekStartsOn),
    [config.dashboardPeriod, config.weekStartsOn],
  )
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  const summaryQuery = useAnalyticsSummary(isEnabled, range)
  const accountsQuery = useAccounts(isEnabled)
  const pendingTransactionsQuery = useTransactions(isEnabled, {
    status: "PENDING",
    limit: 50,
    page: 1,
  })
  const recentTransactionsQuery = useTransactions(isEnabled, {
    limit: 5,
    page: 1,
  })
  const frequentTransactionsQuery = useTransactions(isEnabled, {
    status: "CONFIRMED",
    limit: 30,
    page: 1,
  })
  const categoriesQuery = useCategories(isEnabled)

  const moneyDisplay = {
    ...display,
    currency: summaryQuery.data?.baseCurrency ?? display.currency,
  }

  const accounts = useMemo(
    () => (accountsQuery.data ?? []).filter((account) => account.isActive),
    [accountsQuery.data],
  )
  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId],
  )
  const homeBalance = selectedAccount
    ? {
      label: `Saldo de ${selectedAccount.name}`,
      amount: selectedAccount.balance,
      currency: selectedAccount.currency,
    }
    : {
      label: "Patrimonio neto",
      amount: summaryQuery.data?.netWorth,
      currency: moneyDisplay.currency,
    }
  const balanceFormatted = formatFinanceMoney(homeBalance.amount, {
    ...display,
    currency: homeBalance.currency,
  })
  const pendingHold = (pendingTransactionsQuery.data?.items ?? []).reduce(
    (sum, transaction) =>
      sum + (parseFinanceMoney(transaction.amountBaseCurrency) ?? 0),
    0,
  )
  const pendingHoldLabel =
    pendingHold > 0
      ? `Retenido ${formatFinanceMoney(pendingHold, moneyDisplay)}`
      : undefined
  const cashFlowLabel = summaryQuery.data
    ? `Flujo ${formatFinanceMoney(summaryQuery.data.cashFlow, moneyDisplay)}`
    : undefined
  const recentTransactions = recentTransactionsQuery.data?.items ?? []
  const frequentExpenses = useMemo(
    () =>
      deriveFrequentExpenses(
        frequentTransactionsQuery.data?.items ?? [],
        categoriesQuery.data ?? [],
      ),
    [frequentTransactionsQuery.data?.items, categoriesQuery.data],
  )

  const cycleAccount = useCallback(() => {
    setSelectedAccountId((currentId) => {
      if (accounts.length === 0) return null
      if (!currentId) return accounts[0]?.id ?? null
      const currentIndex = accounts.findIndex((account) => account.id === currentId)
      if (currentIndex < 0) return accounts[0]?.id ?? null
      return currentIndex === accounts.length - 1
        ? null
        : accounts[currentIndex + 1]?.id ?? null
    })
  }, [accounts])
  const goToTransactions = useCallback(() => {
    router.push(APP_ROUTES.app.financeTransactions)
  }, [router])

  return (
    <div className="flex flex-col gap-8">
      <FinanceHomeHero
        balanceLabel={homeBalance.label}
        balanceAmount={balanceFormatted}
        pendingHoldLabel={pendingHoldLabel}
        cashFlowLabel={cashFlowLabel}
        onAccountPress={cycleAccount}
        onSendPress={goToTransactions}
        onReceivePress={goToTransactions}
      />

      <FrequentExpensesSection
        expenses={frequentExpenses}
        query={frequentTransactionsQuery}
      />

      <RecentTransactionsSection
        transactions={recentTransactions}
        categories={categoriesQuery.data ?? []}
        display={display}
        query={recentTransactionsQuery}
      />

      <SummarySection
        title="Estadísticas"
        icon={BarChart3Icon}
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href={APP_ROUTES.app.financeStatistics}>
              Ver estadísticas
              <ArrowRight size={12} className="text-muted-foreground" />
            </Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          Consulta el resumen financiero, los gastos por categoría, la evolución
          en el tiempo y el estado de tus presupuestos.
        </p>
      </SummarySection>
    </div>
  )
}
