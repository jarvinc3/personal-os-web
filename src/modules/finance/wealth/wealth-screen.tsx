"use client"

import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { useBalanceSheet } from "@/src/modules/finance/shared/hooks/use-balance-sheet"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useFinanceIntegrity } from "@/src/modules/finance/shared/hooks/use-integrity"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { WealthCurrencySection } from "@/src/modules/finance/wealth/components/wealth-currency-section"
import { WealthSummary } from "@/src/modules/finance/wealth/components/wealth-summary"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { buttonVariants } from "@/src/shared/components/ui/button"
import { cn } from "@/src/shared/lib/utils"
import { MissingBreakdownNotice } from "@/src/modules/finance/shared/components/layout/missing-breakdown-notice"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { MODULE_REGISTRY } from "@/src/shared/constants/module-registry"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { LandmarkIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function WealthScreen() {
  return (
    <FinanceGate>
      <WealthScreenBody />
    </FinanceGate>
  )
}

function WealthScreenBody() {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const balanceSheetQuery = useBalanceSheet(isEnabled)
  const integrityQuery = useFinanceIntegrity(isEnabled)
  const balanceSheet = balanceSheetQuery.data
  const display: FinanceMoneyDisplay = {
    currency: balanceSheet?.baseCurrency ?? config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const onBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Patrimonio",
      onBack,
      accentColor: MODULE_REGISTRY.finance.accent,
    },
    [onBack]
  )

  if (balanceSheetQuery.isPending && !balanceSheet) {
    return <LoadingView variant="inline" className="py-16" />
  }

  if (balanceSheetQuery.isError && !balanceSheet) {
    return (
      <ErrorState
        message={financeErrorMessage(balanceSheetQuery.error)}
        onRetry={() => void balanceSheetQuery.refetch()}
        isRetrying={balanceSheetQuery.isFetching}
      />
    )
  }

  if (!balanceSheet) {
    return <LoadingView variant="inline" className="py-16" />
  }

  const drifts = integrityQuery.data?.drifts ?? []
  const breakdown = balanceSheet.breakdown
  const groups = breakdown?.byCurrency ?? []

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-8">
      <WealthSummary
        global={balanceSheet.global}
        totals={breakdown?.totals ?? null}
        display={display}
      />

      {breakdown ? null : <MissingBreakdownNotice />}

      {breakdown && groups.length === 0 ? (
        <Empty className="rounded-3xl border border-border bg-card py-10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LandmarkIcon />
            </EmptyMedia>
            <EmptyTitle>Sin productos todavía</EmptyTitle>
            <EmptyDescription>
              Agrega una cuenta o una tarjeta para ver el desglose del
              patrimonio.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Link
              href={APP_ROUTES.app.financeProducts}
              className={cn(buttonVariants({}))}
            >
              <PlusIcon className="size-4 shrink-0" />
              Ir a Productos
            </Link>
          </EmptyContent>
        </Empty>
      ) : (
        groups.map((group) => (
          <WealthCurrencySection
            key={group.currency}
            group={group}
            display={display}
            drifts={drifts}
          />
        ))
      )}

      {groups.length > 1 ? (
        <p className="px-2 text-xs text-muted-foreground">
          Cada moneda se muestra por separado. No se convierten entre sí.
        </p>
      ) : null}

      {balanceSheetQuery.isError ? (
        <ErrorState
          message={financeErrorMessage(balanceSheetQuery.error)}
          onRetry={() => void balanceSheetQuery.refetch()}
          isRetrying={balanceSheetQuery.isFetching}
        />
      ) : null}
    </div>
  )
}
