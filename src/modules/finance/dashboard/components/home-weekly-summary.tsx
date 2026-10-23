"use client"

import { useWeeklySummary } from "@/src/modules/finance/dashboard/hooks/use-weekly-summary"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { CardProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { Badge } from "@/src/shared/components/ui/badge"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
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
  const summary = summaryQuery.data
  const cards = cardsQuery.data ?? []
  const accounts = accountsQuery.data ?? []

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
            <Badge key={category.name} variant="outline" className="text-xs">
              {category.name} {formatFinanceMoney(category.total, display)}
            </Badge>
          ))}
        </div>
      ) : null}

      {summary.budgetsAtRisk.map((budget) => (
        <SummaryItem
          key={budget.id}
          title={budget.name}
          description={`${Math.round(budget.pctUsed)}% del presupuesto`}
          value={formatFinanceMoney(budget.limit, display)}
        />
      ))}

      {summary.upcomingInstallments.map((installment) => (
        <SummaryItem
          key={installment.loanId}
          title={installment.lenderName}
          description={`Cuota · ${formatShortDate(installment.dueDate, formatLocale)}`}
          value={formatFinanceMoney(installment.amount, display)}
        />
      ))}

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
