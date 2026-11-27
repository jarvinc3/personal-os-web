"use client"

import { MerchantCard } from "@/src/modules/finance/merchants/components/merchant-card"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useMerchants } from "@/src/modules/finance/shared/hooks/use-merchants"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { hasSuggestedCategory } from "@/src/modules/finance/merchants/lib/merchant-duplicates"
import { merchantMonthParams } from "@/src/modules/finance/merchants/lib/merchant-query"
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { Skeleton } from "@/src/shared/components/ui/skeleton"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { SummarySection } from "@/src/shared/components/data-display/summary"
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
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
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
  const categoriesQuery = useCategories(isEnabled)
  const categories = categoriesQuery.data ?? []
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  return (
    <div className="flex flex-col gap-4">
      <Field className="gap-0.5">
        <FieldLabel
          htmlFor="merchant-search"
          className="pl-2 text-sm text-muted-foreground"
        >
          Buscar
        </FieldLabel>
        <InputGroup className="h-10 overflow-hidden px-1">
          <InputGroupAddon align="inline-start">
            <SearchIcon className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            id="merchant-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Uber, Netflix…"
          />
        </InputGroup>
      </Field>

      {listQuery.isError ? (
        <ErrorState
          message={financeErrorMessage(listQuery.error)}
          onRetry={() => void listQuery.refetch()}
          isRetrying={listQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={listQuery.isPending && !listQuery.data}
        pendingFallback={
          <div className="flex flex-col gap-2 px-3 py-2" aria-hidden>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        }
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
          {items.map((merchant) => (
            <MerchantCard
              key={merchant.id}
              merchant={merchant}
              category={
                categories.find(
                  (category) => category.id === merchant.categoryId
                ) ?? null
              }
              display={display}
              suggested={hasSuggestedCategory(merchant)}
              duplicate={(merchant.possibleDuplicates ?? 0) > 0}
              href={APP_ROUTES.app.financeMerchant(merchant.id)}
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
