"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { PlanningProgressCard } from "@/src/modules/finance/shared/components/planning-progress-card"
import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  formatFinanceMoney,
  parseFinanceMoney,
} from "@/src/modules/finance/shared/lib/money"
import {
  amountRatioPct,
  joinPlanningCaption,
} from "@/src/modules/finance/shared/lib/planning-lists"
import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities"
import {
  remainingCaption,
  withCurrency,
} from "@/src/modules/finance/planning/lib/planning-captions"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { PiggyBankIcon, PlusIcon } from "lucide-react"

type PlanningSavingsTabProps = {
  goals: FinanceSavingsGoal[]
  pending: boolean
  display: FinanceMoneyDisplay
  onCreate: () => void
}

export function PlanningSavingsTab({
  goals,
  pending,
  display,
  onCreate,
}: PlanningSavingsTabProps) {
  return (
    <AsyncRegion
      pending={pending}
      pendingFallback={<FinanceListSkeleton />}
      empty={goals.length === 0}
      emptyFallback={
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PiggyBankIcon />
            </EmptyMedia>
            <EmptyTitle>Aún no hay metas</EmptyTitle>
            <EmptyDescription>
              Define un objetivo y ve cuánto llevas ahorrado.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={onCreate}>
              <PlusIcon className="size-4 shrink-0" />
              Crear meta
            </Button>
          </EmptyContent>
        </Empty>
      }
    >
      {goals.map((goal) => {
        const money = withCurrency(display, goal.currency)
        const current = parseFinanceMoney(goal.currentAmount)
        const target = parseFinanceMoney(goal.targetAmount)
        return (
          <PlanningProgressCard
            key={goal.id}
            title={goal.name}
            description={goal.description ?? undefined}
            icon={PiggyBankIcon}
            tone={goal.isCompleted ? "success" : "info"}
            badge={{
              label: goal.isCompleted ? "Completada" : "En curso",
              variant: goal.isCompleted ? "success" : "info",
            }}
            progress={amountRatioPct(goal.currentAmount, goal.targetAmount)}
            currentHint="Ahorrado"
            currentLabel={formatFinanceMoney(goal.currentAmount, money)}
            targetHint="Meta"
            targetLabel={formatFinanceMoney(goal.targetAmount, money)}
            caption={joinPlanningCaption(
              remainingCaption({
                current,
                target,
                display: money,
                reached: "Meta alcanzada",
                prefix: "Faltan",
              }),
              goal.targetDate
                ? `Para ${formatCalendarDate(goal.targetDate, display.locale)}`
                : undefined
            )}
            href={APP_ROUTES.app.financeSavingsGoal(goal.id)}
          />
        )
      })}
    </AsyncRegion>
  )
}
