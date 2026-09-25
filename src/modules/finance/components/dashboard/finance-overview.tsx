"use client"

import { useCategories } from "@/src/modules/finance/hooks/use-categories";
import { useFinanceEnabled } from "@/src/modules/finance/hooks/use-finance-enabled";
import { useTransactions } from "@/src/modules/finance/hooks/use-transactions";
import { deriveFrequentExpenses } from "@/src/modules/finance/lib/finance-home";
import { SettingsSection } from "@/src/shared/components/layout/settings-section";
import { SummaryItem } from "@/src/shared/components/ui/summary";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { BarChart3Icon } from "lucide-react";
import { useMemo } from "react";
import { FinanceHomeHeroSection } from "./finance-home-hero-section";
import {
  FrequentExpensesSection,
  RecentTransactionsSection,
} from "./finance-home-sections";

export function FinanceOverview() {
  const { isEnabled, config } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

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

  const recentTransactions = recentTransactionsQuery.data?.items ?? []
  const frequentExpenses = useMemo(
    () =>
      deriveFrequentExpenses(
        frequentTransactionsQuery.data?.items ?? [],
        categoriesQuery.data ?? []
      ),
    [frequentTransactionsQuery.data?.items, categoriesQuery.data]
  )

  return (
    <div className="flex flex-col gap-8">
      <FinanceHomeHeroSection />

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

      <SettingsSection title="Atajos">
        <SummaryItem
          title="Estadísticas"
          description="Graficos de resumenes financieros"
          icon={BarChart3Icon}
          href={APP_ROUTES.app.financeStatistics}
          showChevron
          isLast
          className="px-3"
        />
      </SettingsSection>
    </div>
  )
}
