"use client"

import { GoalCard } from "@/src/modules/finance/savings-goals"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { FinanceSavingsGoal } from "@/src/modules/finance/shared/types/entities"
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
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          display={display}
          href={APP_ROUTES.app.financeSavingsGoal(goal.id)}
        />
      ))}
    </AsyncRegion>
  )
}
