"use client"

import { AsyncRegion } from "@/src/modules/finance/shared/components/layout/async-region"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { MissingRecord } from "@/src/modules/finance/shared/components/layout/missing-record"
import { FinanceGate } from "@/src/modules/finance/finance-gate"
import { MerchantEditSheet } from "@/src/modules/finance/merchants/components/merchant-edit-sheet"
import { MerchantCard } from "@/src/modules/finance/merchants/components/merchant-card"
import { TransactionMovementRow } from "@/src/modules/finance"
import { merchantMonthParams } from "@/src/modules/finance/merchants/lib/merchant-query"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useInfiniteFinanceList } from "@/src/modules/finance/shared/hooks/use-infinite-finance-list"
import {
  useDismissMerchantDuplicate,
  useMergeMerchant,
  useMerchant,
  useMerchantDuplicates,
  useMerchants,
  useUndoDismissMerchantDuplicate,
} from "@/src/modules/finance/shared/hooks/use-merchants"
import { showUndoToast } from "@/src/modules/finance/shared/components/undo-toast"
import {
  duplicateNamesLabel,
  duplicateReasonLabel,
  hasSuggestedCategory,
} from "@/src/modules/finance/merchants/lib/merchant-duplicates"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import {
  FINANCE_TRANSACTIONS_QUERY_KEY,
  type FinancePaginated,
} from "@/src/modules/finance/shared/types/api"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { useEventSheet } from "@/src/shared/hooks/use-event-sheet"
import { LoadingView } from "@/src/shared/components/feedback/loading-view"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
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
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { usePageHeader } from "@/src/shared/hooks/use-page-header"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  XIcon,
  CopyIcon,
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
  const { isEnabled, config, formatLocale } = useFinanceEnabled()
  const router = useRouter()
  const { open: editOpen, setOpen: setEditOpen } = useSheetParam(
    FINANCE_SHEET_KEYS.merchantEdit
  )
  const mergeSheet = useEventSheet("merchant-merge-sheet")
  const mergeOpen = mergeSheet.open
  const [mergeTarget, setMergeTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [mergeSearch, setMergeSearch] = useState("")
  const month = useMemo(() => merchantMonthParams(), [])
  const merchantQuery = useMerchant(isEnabled, merchantId)
  const merchant = merchantQuery.data ?? null
  const mergeMutation = useMergeMerchant()
  const duplicatesQuery = useMerchantDuplicates(
    isEnabled && Boolean(merchant),
    merchantId
  )
  const dismissDuplicate = useDismissMerchantDuplicate()
  const undoDismissDuplicate = useUndoDismissMerchantDuplicate()
  const duplicates = duplicatesQuery.data ?? []
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
  const categoriesQuery = useCategories(isEnabled)
  const categories = categoriesQuery.data ?? []
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
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

  function onMergeDuplicate(target: { id: string; name: string }) {
    setMergeTarget(target)
    mergeSheet.openSheet()
  }

  function onDismissDuplicate(target: { id: string; name: string }) {
    dismissDuplicate.mutate(
      { id: merchantId, otherId: target.id },
      {
        onSuccess: () => {
          showUndoToast(`«${target.name}» marcado como otro comercio`, () =>
            undoDismissDuplicate.mutate({ id: merchantId, otherId: target.id })
          )
        },
        onError: (error) =>
          appToast.error({ text1: financeErrorMessage(error) }),
      }
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
      mergeSheet.closeSheet()
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
      <MerchantCard
        merchant={merchant}
        category={
          categories.find((category) => category.id === merchant.categoryId) ??
          null
        }
        display={display}
        size="header"
        suggested={hasSuggestedCategory(merchant)}
        duplicate={duplicates.length > 0}
      />

      {duplicates.length > 0 ? (
        <Alert>
          <CopyIcon />
          <AlertTitle>
            {`Posible duplicado de ${duplicateNamesLabel(duplicates)}`}
          </AlertTitle>
          <AlertDescription>
            Revisa si es el mismo comercio antes de unir: al unir, sus
            movimientos pasan al otro y este desaparece.
          </AlertDescription>
          <div className="col-start-2 flex flex-col gap-2">
            {duplicates.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {candidate.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {duplicateReasonLabel(candidate.reason)}
                  </span>
                </span>
                <span className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      onMergeDuplicate({
                        id: candidate.id,
                        name: candidate.name,
                      })
                    }
                  >
                    <GitMergeIcon className="size-4 shrink-0" />
                    Unir
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={dismissDuplicate.isPending}
                    onClick={() =>
                      onDismissDuplicate({
                        id: candidate.id,
                        name: candidate.name,
                      })
                    }
                  >
                    <XIcon className="size-4 shrink-0" />
                    No es duplicado
                  </Button>
                </span>
              </div>
            ))}
          </div>
        </Alert>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => mergeSheet.openSheet()}
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
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <StoreIcon />
                </EmptyMedia>
                <EmptyTitle>Sin movimientos</EmptyTitle>
                <EmptyDescription>
                  Este comercio todavía no tiene movimientos.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          }
        >
          {movements.map((transaction) => (
            <TransactionMovementRow
              key={transaction.id}
              transaction={transaction}
              categories={categories}
              display={display}
              href={APP_ROUTES.app.financeTransaction(transaction.id)}
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
          mergeSheet.onOpenChange(next)
          if (!next) {
            setMergeTarget(null)
            setMergeSearch("")
          }
        }}
        pending={mergeMutation.isPending}
        title="Unir comercio"
        description="Los movimientos del comercio abierto pasan al que elijas."
      >
        {duplicates.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Sugeridos
            </p>
            <div className="rounded-2xl border border-border bg-card">
              {duplicates.map((candidate) => (
                <MerchantCard
                  key={candidate.id}
                  merchant={candidate}
                  display={display}
                  variant="compact"
                  duplicate
                  selected={mergeTarget?.id === candidate.id}
                  onPress={() =>
                    setMergeTarget({ id: candidate.id, name: candidate.name })
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        <FormTextField
          label="Buscar"
          icon={SearchIcon}
          value={mergeSearch}
          onChange={setMergeSearch}
          placeholder="Netflix, Uber…"
        />
        <div className="rounded-2xl border border-border bg-card">
          {candidates.map((candidate) => (
            <MerchantCard
              key={candidate.id}
              merchant={candidate}
              category={
                categories.find(
                  (category) => category.id === candidate.categoryId
                ) ?? null
              }
              display={display}
              variant="compact"
              selected={mergeTarget?.id === candidate.id}
              onPress={() =>
                setMergeTarget({ id: candidate.id, name: candidate.name })
              }
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
