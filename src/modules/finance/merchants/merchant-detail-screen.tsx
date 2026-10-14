"use client"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { MerchantEditSheet } from "@/src/modules/finance/merchants/components/merchant-edit-sheet"
import { merchantMonthParams } from "@/src/modules/finance/merchants/lib/merchant-query"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import {
  useMergeMerchant,
  useMerchant,
  useMerchants,
} from "@/src/modules/finance/shared/hooks/use-merchants"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatFinanceDateTimeLabel } from "@/src/modules/finance/shared/lib/ledger-form"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { signedAmount } from "@/src/modules/finance/shared/lib/transactions-query"
import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type {
  FinanceMerchant,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { LoadingView } from "@/src/shared/components/layout/loading-view"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { InfiniteListSentinel } from "@/src/shared/components/ui/infinite-list-sentinel"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummaryItem, SummarySection } from "@/src/shared/components/ui/summary"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  XIcon,
  GitMergeIcon,
  PencilIcon,
  SearchIcon,
  StoreIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

export function MerchantDetailScreen({ merchantId }: { merchantId: string }) {
  return (
    <FinanceGate>
      <MerchantDetailBody merchantId={merchantId} />
    </FinanceGate>
  )
}

function MerchantDetailBody({ merchantId }: { merchantId: string }) {
  const { isEnabled, config } = useFinanceEnabled()
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [mergeOpen, setMergeOpen] = useState(false)
  const [mergeTarget, setMergeTarget] = useState<FinanceMerchant | null>(null)
  const [mergeSearch, setMergeSearch] = useState("")
  const month = useMemo(() => merchantMonthParams(), [])
  const merchantQuery = useMerchant(isEnabled, merchantId)
  const merchant = merchantQuery.data ?? null
  const mergeMutation = useMergeMerchant()
  const movementsQuery = useInfiniteFinanceList<
    FinancePaginated<FinanceTransaction>
  >({
    queryKey: [...FINANCE_TRANSACTIONS_QUERY_KEY, "merchant", merchantId],
    endpoint: API_ENDPOINTS.FINANCE.TRANSACTIONS,
    params: { merchantId, limit: 20, groupOperations: true },
    enabled: isEnabled && Boolean(merchant),
  })
  const mergeCandidates = useMerchants(mergeOpen, {
    search: mergeSearch.trim() || undefined,
    dateFrom: month.dateFrom,
    dateTo: month.dateTo,
  })
  const movements = infiniteListItems(movementsQuery.data)
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
  }

  usePageHeader(
    {
      variant: "secondary",
      title: merchant?.name ?? "Comercio",
      onBack: () => router.back(),
      actions: merchant ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditOpen(true)}
        >
          <PencilIcon className="size-4 shrink-0" />
          Editar
        </Button>
      ) : undefined,
    },
    [merchant?.name]
  )

  if (merchantQuery.isPending && !merchant) {
    return <LoadingView variant="screen" />
  }

  if (merchantQuery.isError || !merchant) {
    if (merchantQuery.isError) {
      return (
        <FinanceErrorState
          message={financeErrorMessage(merchantQuery.error)}
          onRetry={() => void merchantQuery.refetch()}
          isRetrying={merchantQuery.isFetching}
        />
      )
    }
    return (
      <MissingRecord
        icon={StoreIcon}
        title="Comercio no encontrado"
        description="Puede que se haya unido con otro comercio."
        backHref={APP_ROUTES.app.financeMerchants}
        backLabel="Volver a comercios"
      />
    )
  }

  async function confirmMerge() {
    if (!mergeTarget) {
      return
    }
    try {
      const merged = await mergeMutation.mutateAsync({
        id: merchantId,
        targetId: mergeTarget.id,
      })
      appToast.success({ text1: `Unido en ${merged.name}` })
      setMergeTarget(null)
      setMergeOpen(false)
      router.replace(APP_ROUTES.app.financeMerchant(merged.id))
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const candidates = infiniteListItems(mergeCandidates.data).filter(
    (candidate) => candidate.id !== merchantId
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4">
        <BrandLogo name={merchant.name} logoUrl={merchant.logoUrl} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium">{merchant.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {merchant.monthMovements} movimiento
            {merchant.monthMovements === 1 ? "" : "s"} este mes
          </p>
        </div>
        <p className="text-sm font-semibold">
          {formatFinanceMoney(merchant.monthSpend, display)}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setMergeOpen(true)}
        >
          <GitMergeIcon className="size-4 shrink-0" />
          Unir con otro comercio
        </Button>
      </div>

      {movementsQuery.isError ? (
        <FinanceErrorState
          message={financeErrorMessage(movementsQuery.error)}
          onRetry={() => void movementsQuery.refetch()}
          isRetrying={movementsQuery.isFetching}
        />
      ) : null}

      <SummarySection title="Movimientos" icon={StoreIcon}>
        <AsyncRegion
          pending={movementsQuery.isPending && !movementsQuery.data}
          pendingFallback={<FinanceListSkeleton />}
          empty={movements.length === 0}
          emptyFallback={
            <p className="px-3 py-6 text-sm text-muted-foreground">
              Este comercio todavía no tiene movimientos.
            </p>
          }
        >
          {movements.map((transaction, index) => (
            <SummaryItem
              key={transaction.id}
              title={
                transaction.merchantName ??
                transaction.merchant ??
                transaction.description ??
                "Movimiento"
              }
              description={formatFinanceDateTimeLabel(
                transaction.transactionDate
              )}
              value={signedAmount(transaction, {
                ...display,
                currency: transaction.currency,
              })}
              href={APP_ROUTES.app.financeTransaction(transaction.id)}
              isLast={index === movements.length - 1}
              className="px-3"
            />
          ))}
        </AsyncRegion>
        <InfiniteListSentinel
          hasNextPage={movementsQuery.hasNextPage}
          isFetchingNextPage={movementsQuery.isFetchingNextPage}
          onLoadMore={() => void movementsQuery.fetchNextPage()}
        />
      </SummarySection>

      <MerchantEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        merchant={merchant}
      />

      <BottomSheet
        open={mergeOpen}
        onOpenChange={(next) => {
          setMergeOpen(next)
          if (!next) {
            setMergeTarget(null)
            setMergeSearch("")
          }
        }}
        pending={mergeMutation.isPending}
        title="Unir comercio"
        description="Los movimientos del comercio abierto pasan al que elijas."
        actions={{
          close: (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setMergeOpen(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
        }}
      >
        <FormTextField
          label="Buscar"
          icon={SearchIcon}
          value={mergeSearch}
          onChange={setMergeSearch}
          placeholder="Netflix, Uber…"
        />
        <div className="rounded-2xl border border-border bg-card">
          {candidates.map((candidate) => (
            <SummaryItem
              key={candidate.id}
              title={candidate.name}
              leading={
                <BrandLogo
                  name={candidate.name}
                  logoUrl={candidate.logoUrl}
                  size={32}
                />
              }
              onPress={() => setMergeTarget(candidate)}
              isLast={false}
              className="px-3"
            />
          ))}
        </div>
        <InfiniteListSentinel
          hasNextPage={mergeCandidates.hasNextPage}
          isFetchingNextPage={mergeCandidates.isFetchingNextPage}
          onLoadMore={() => void mergeCandidates.fetchNextPage()}
        />
      </BottomSheet>

      <AlertDialog
        open={mergeTarget !== null}
        onOpenChange={(open) => !open && setMergeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Unir {merchant.name} en {mergeTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Los movimientos de {merchant.name} pasarán a {mergeTarget?.name}.
              El comercio original desaparece. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mergeMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={mergeMutation.isPending}
              onClick={() => void confirmMerge()}
            >
              {mergeMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Unir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
