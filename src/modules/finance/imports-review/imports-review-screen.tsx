"use client"

import { ImportReviewCard } from "@/src/modules/finance/imports-review/components/import-review-card"
import { useImportReviewQueue } from "@/src/modules/finance/imports-review/hooks/use-import-review-queue"
import { isImportReviewEndpointUnavailable } from "@/src/modules/finance/imports-review/lib/import-review-view"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { financeLoadErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { InfoIcon, MailSearchIcon, MailWarningIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

/** Cards que se montan de entrada; el resto entra al bajar. */
const IMPORTS_PAGE_SIZE = 12

export function ImportsReviewScreen() {
  return (
    <FinanceGate>
      <ImportsReviewScreenBody />
    </FinanceGate>
  )
}

function ImportsReviewScreenBody() {
  const router = useRouter()
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const queueQuery = useImportReviewQueue(isEnabled)
  const items = queueQuery.data ?? []
  const [visibleCount, setVisibleCount] = useState(IMPORTS_PAGE_SIZE)
  const shown = items.slice(0, visibleCount)
  const unavailable = isImportReviewEndpointUnavailable(queueQuery.error)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }

  const handleBack = useCallback(() => {
    router.push(APP_ROUTES.app.financeProducts)
  }, [router])

  usePageHeader(
    {
      variant: "secondary",
      title: "Imports en revisión",
      onBack: handleBack,
    },
    [handleBack]
  )

  if (unavailable) {
    return (
      <Alert>
        <InfoIcon aria-hidden />
        <AlertTitle>Solo disponible en desarrollo</AlertTitle>
        <AlertDescription>
          La cola de imports en revisión se habilita cuando el entorno la tiene
          desplegada. Aquí no hay nada que revisar.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SummarySection title="Imports del correo" icon={MailWarningIcon}>
        <p className="px-1 text-sm text-muted-foreground">
          Correos que se leyeron y no se pudieron registrar solos. Cada uno
          explica qué falta para importarlo.
        </p>
      </SummarySection>

      {queueQuery.isError ? (
        <ErrorState
          message={financeLoadErrorMessage(queueQuery.error)}
          onRetry={() => void queueQuery.refetch()}
          isRetrying={queueQuery.isFetching}
        />
      ) : null}

      <AsyncRegion
        pending={queueQuery.isPending && !queueQuery.data}
        pendingFallback={<ListSkeleton rows={3} />}
        empty={!queueQuery.isError && items.length === 0}
        emptyFallback={
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MailSearchIcon />
              </EmptyMedia>
              <EmptyTitle>Sin imports en revisión</EmptyTitle>
              <EmptyDescription>
                Ningún correo está esperando una decisión.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        }
      >
        <div className="flex flex-col gap-2">
          {shown.map((item) => (
            <ImportReviewCard key={item.id} item={item} display={display} />
          ))}
        </div>
        <InfiniteListSentinel
          hasNextPage={shown.length < items.length}
          isFetchingNextPage={false}
          onLoadMore={() =>
            setVisibleCount((current) => current + IMPORTS_PAGE_SIZE)
          }
        />
      </AsyncRegion>
    </div>
  )
}
