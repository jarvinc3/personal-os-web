"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { LoanProgressCard } from "@/src/modules/finance/loans"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceInstitution,
  FinanceLoan,
} from "@/src/modules/finance/shared/types/entities"
import { Button } from "@/src/shared/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { HandCoinsIcon, PlusIcon } from "lucide-react"

type PlanningLoansTabProps = {
  loans: FinanceLoan[]
  institutions: FinanceInstitution[]
  pending: boolean
  creating: boolean
  display: FinanceMoneyDisplay
  onCreate: () => void
}

export function PlanningLoansTab({
  loans,
  institutions,
  pending,
  creating,
  display,
  onCreate,
}: PlanningLoansTabProps) {
  return (
    <AsyncRegion
      pending={pending}
      pendingFallback={
        <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      }
      empty={loans.length === 0}
      emptyFallback={
        <Empty className="py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HandCoinsIcon />
            </EmptyMedia>
            <EmptyTitle>Aún no hay préstamos</EmptyTitle>
            <EmptyDescription>
              Registra cuotas, tasa anual y próximo vencimiento.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={onCreate} disabled={creating}>
              {creating ? (
                <Spinner className="size-4" />
              ) : (
                <PlusIcon className="size-4 shrink-0" />
              )}
              Crear préstamo
            </Button>
          </EmptyContent>
        </Empty>
      }
    >
      {loans.map((loan) => (
        <LoanProgressCard
          key={loan.id}
          loan={loan}
          display={display}
          institution={institutions.find(
            (item) => item.id === loan.institutionId
          )}
          href={APP_ROUTES.app.financeLoan(loan.id)}
        />
      ))}
    </AsyncRegion>
  )
}
