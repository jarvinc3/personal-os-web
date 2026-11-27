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
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { formatDayMonth } from "@/src/shared/lib/date-format"

import { CalendarDaysIcon } from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/src/shared/components/ui/item"

const MODULE_ACCENT = getModule("finance").accent

function formatShortDate(value: string, locale: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return formatDayMonth(date, locale)
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
            <Item
              key={risk.id}
              variant="plain"
              className={"border-b border-border/60"}
            >
              <ItemContent>
                <ItemTitle>{risk.name}</ItemTitle>
                <ItemDescription className="truncate text-xs">
                  {`${Math.round(risk.pctUsed)}% del presupuesto`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="text-sm font-semibold tabular-nums">
                  {formatFinanceMoney(risk.limit, display)}
                </span>
              </ItemActions>
            </Item>
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
            <Item
              key={installment.loanId}
              variant="plain"
              className={"border-b border-border/60"}
            >
              <ItemContent>
                <ItemTitle>{installment.lenderName}</ItemTitle>
                <ItemDescription className="truncate text-xs">
                  {`Cuota · ${formatShortDate(installment.dueDate, formatLocale)}`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="text-sm font-semibold tabular-nums">
                  {formatFinanceMoney(installment.amount, display)}
                </span>
              </ItemActions>
            </Item>
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
            <Item
              key={dueCard.cardId}
              variant="plain"
              className={"border-b border-border/60"}
            >
              <ItemContent>
                <ItemTitle>{dueCard.name}</ItemTitle>
                <ItemDescription className="truncate text-xs">
                  {`Vence el día ${dueCard.dueDay}`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <span className="text-sm font-semibold tabular-nums">
                  {dueCard.lastFour ? `…${dueCard.lastFour}` : undefined}
                </span>
              </ItemActions>
            </Item>
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
        <Item variant="plain" className={"border-b border-border/60"}>
          <ItemContent>
            <ItemTitle>{"Correos por revisar"}</ItemTitle>
            <ItemDescription className="truncate text-xs">
              {"Movimientos de banco sin confirmar"}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <span className="text-sm font-semibold tabular-nums">
              {String(summary.pendingEmails)}
            </span>
          </ItemActions>
        </Item>
      ) : null}
    </SummarySection>
  )
}
