"use client"

import { useWeeklySummary } from "@/src/modules/finance/dashboard/hooks/use-weekly-summary"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { LoanProgressCard } from "@/src/modules/finance/loans"
import { useLoans } from "@/src/modules/finance/shared/hooks/use-loans"
import { useBudgets } from "@/src/modules/finance/shared/hooks/use-budgets"
import { BudgetCard } from "@/src/modules/finance/budgets"
import { FINANCE_BUDGET_PAGE_SIZE } from "@/src/modules/finance/shared/lib/budgets-query"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { CalendarDaysIcon } from "lucide-react"

const MODULE_ACCENT = getModule("finance").accent

function formatShortDate(value: string, locale: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString(locale, { day: "numeric", month: "short" })
}

export function FinanceHomeWeeklySummary() {
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const summaryQuery = useWeeklySummary(isEnabled)
  const cardsQuery = useCards(isEnabled)
  const accountsQuery = useAccounts(isEnabled)
  const loansQuery = useLoans(isEnabled)
  const budgetsQuery = useBudgets(isEnabled, {
    limit: FINANCE_BUDGET_PAGE_SIZE,
  })
  const summary = summaryQuery.data
  const cards = cardsQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const loans = loansQuery.data ?? []
  const budgets = infiniteListItems(budgetsQuery.data)

  if (!isEnabled || !summary) {
    return null
  }

  const display = {
    currency: summary.currency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  return (
    <SummarySection
      icon={CalendarDaysIcon}
      title="Resumen semanal"
      color={MODULE_ACCENT}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1 rounded-2xl bg-card/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Gastos de la semana</p>
          <p className="text-sm font-semibold tabular-nums">
            {formatFinanceMoney(summary.expenses, display)}
          </p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl bg-card/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Promedio semanal</p>
          <p className="text-sm font-semibold tabular-nums">
            {formatFinanceMoney(summary.averageExpenses, display)}
          </p>
        </div>
      </div>

      {summary.topCategories.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {summary.topCategories.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              icon={category.icon}
              color={category.color}
              isSystem={false}
              amount={formatFinanceMoney(category.total, display)}
              variant="chip"
            />
          ))}
        </div>
      ) : null}

      {summary.budgetsAtRisk.map((risk) => {
        const budget = budgets.find((item) => item.id === risk.id)
        if (!budget) {
          return (
            <SummaryItem
              key={risk.id}
              title={risk.name}
              description={`${Math.round(risk.pctUsed)}% del presupuesto`}
              value={formatFinanceMoney(risk.limit, display)}
            />
          )
        }
        return (
          <BudgetCard
            key={risk.id}
            budget={budget}
            display={display}
            variant="compact"
          />
        )
      })}

      {summary.upcomingInstallments.map((installment) => {
        const loan = loans.find((item) => item.id === installment.loanId)
        if (!loan) {
          return (
            <SummaryItem
              key={installment.loanId}
              title={installment.lenderName}
              description={`Cuota · ${formatShortDate(installment.dueDate, formatLocale)}`}
              value={formatFinanceMoney(installment.amount, display)}
            />
          )
        }
        return (
          <LoanProgressCard
            key={installment.loanId}
            loan={loan}
            display={display}
            variant="compact"
          />
        )
      })}

      {summary.cardDueDates.map((dueCard) => {
        const card = cards.find((item) => item.id === dueCard.cardId)
        if (!card) {
          return (
            <SummaryItem
              key={dueCard.cardId}
              title={dueCard.name}
              description={`Vence el día ${dueCard.dueDay}`}
              value={dueCard.lastFour ? `…${dueCard.lastFour}` : undefined}
            />
          )
        }
        return (
          <CardProductRow
            key={dueCard.cardId}
            card={card}
            accounts={accounts}
            display={display}
            variant="compact"
            trailingNote={`Vence el día ${dueCard.dueDay}`}
          />
        )
      })}

      {summary.pendingEmails > 0 ? (
        <SummaryItem
          title="Correos por revisar"
          description="Movimientos de banco sin confirmar"
          value={String(summary.pendingEmails)}
        />
      ) : null}
    </SummarySection>
  )
}
