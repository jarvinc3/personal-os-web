"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useMerchants } from "@/src/modules/finance/shared/hooks/use-merchants"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { merchantMonthParams } from "@/src/modules/finance/merchants/lib/merchant-query"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { SearchIcon, StoreIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

export function MerchantsScreen() {
  return (
    <FinanceGate>
      <MerchantsScreenBody />
    </FinanceGate>
  )
}

function MerchantsScreenBody() {
  const router = useRouter()
  const { isEnabled, config } = useFinanceEnabled()
  const [search, setSearch] = useState("")

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Comercios",
      onBack: handleBack,
    },
    [handleBack]
  )
  const month = useMemo(() => merchantMonthParams(), [])
  const listQuery = useMerchants(isEnabled, {
    search: search.trim() || undefined,
    dateFrom: month.dateFrom,
    dateTo: month.dateTo,
  })
  const items = infiniteListItems(listQuery.data)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  return (
    <div className="flex flex-col gap-4">
      <FormTextField
        label="Buscar"
        icon={SearchIcon}
        value={search}
        onChange={setSearch}
        placeholder="Uber, Netflix…"
      />

      {listQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
          isRetrying={listQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={listQuery.isPending && !listQuery.data}
        pendingFallback={<FinanceListSkeleton />}
        empty={items.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <StoreIcon />
              </EmptyMedia>
              <EmptyTitle>Sin comercios</EmptyTitle>
              <EmptyDescription>
                {search.trim()
                  ? "Ningún comercio coincide con la búsqueda."
                  : "Los comercios aparecen cuando registras o importas movimientos."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <SummarySection title="Comercios" icon={StoreIcon}>
          {items.map((merchant, index) => (
            <SummaryItem
              key={merchant.id}
              title={merchant.name}
              leading={
                <BrandLogo
                  name={merchant.name}
                  logoUrl={merchant.logoUrl}
                  size={36}
                />
              }
              description={
                merchant.monthMovements > 0
                  ? `${merchant.monthMovements} movimiento${merchant.monthMovements === 1 ? "" : "s"} este mes`
                  : "Sin movimientos este mes"
              }
              value={formatFinanceMoney(merchant.monthSpend, display)}
              href={APP_ROUTES.app.financeMerchant(merchant.id)}
              showChevron
              isLast={index === items.length - 1}
              className="px-3"
            />
          ))}
        </SummarySection>
      </AsyncRegion>

      <InfiniteListSentinel
        hasNextPage={listQuery.hasNextPage}
        isFetchingNextPage={listQuery.isFetchingNextPage}
        onLoadMore={() => void listQuery.fetchNextPage()}
      />
    </div>
  )
}
