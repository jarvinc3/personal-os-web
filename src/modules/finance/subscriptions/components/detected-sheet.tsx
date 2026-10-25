"use client"

import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { FinanceListSkeleton } from "@/src/modules/finance/shared/components/layout/list-skeleton"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useCreateSubscription } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import {
  useRecurring,
  useUpdateRecurring,
} from "@/src/modules/finance/shared/hooks/use-recurring"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import { subscriptionPayloadFromPattern } from "@/src/modules/finance/subscriptions/lib/subscription-view"
import { RecurringArchiveSheet } from "@/src/modules/finance/subscriptions/components/recurring-archive-sheet"
import { RecurringPatternCard } from "@/src/modules/finance/subscriptions/components/recurring-pattern-card"
import type { FinanceRecurringPattern } from "@/src/modules/finance/shared/types/entities"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { appToast } from "@/src/shared/lib/app-toast"
import { CheckIcon, InboxIcon, XIcon } from "lucide-react"
import { useState } from "react"

type DetectedSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEnabled: boolean
  display: FinanceMoneyDisplay
}

/** Recurring charges detected from the mailbox, waiting to be confirmed. */
export function DetectedSheet({
  open,
  onOpenChange,
  isEnabled,
  display,
}: DetectedSheetProps) {
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const recurringQuery = useRecurring(isEnabled && open, "SUGGESTED")
  const categoriesQuery = useCategories(isEnabled && open)
  const updateMutation = useUpdateRecurring()
  const createMutation = useCreateSubscription()
  const patterns = infiniteListItems(recurringQuery.data)
  const categories = categoriesQuery.data ?? []

  async function confirm(pattern: FinanceRecurringPattern) {
    setConfirmingId(pattern.id)
    try {
      await createMutation.mutateAsync(subscriptionPayloadFromPattern(pattern))
      await updateMutation.mutateAsync({
        id: pattern.id,
        body: { status: "CONFIRMED" },
      })
      appToast.success({ text1: `${pattern.merchantName} es suscripción` })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    } finally {
      setConfirmingId(null)
    }
  }

  async function dismiss(pattern: FinanceRecurringPattern) {
    try {
      await updateMutation.mutateAsync({
        id: pattern.id,
        body: { status: "DISMISSED" },
      })
      appToast.success({ text1: "Descartado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Detectados del correo"
        description="Cobros repetidos que pueden ser suscripciones"
        actions={{
          close: (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cerrar
            </Button>
          ),
          submit: (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setArchiveOpen(true)}
            >
              <InboxIcon className="size-4 shrink-0" />
              Bandeja completa
            </Button>
          ),
        }}
      >
        {recurringQuery.isError ? (
          <FinanceErrorState
            message={financeErrorMessage(recurringQuery.error)}
            onRetry={() => void recurringQuery.refetch()}
            isRetrying={recurringQuery.isFetching}
          />
        ) : null}
        {recurringQuery.isPending && !recurringQuery.data ? (
          <FinanceListSkeleton rows={3} />
        ) : null}
        {!recurringQuery.isPending && patterns.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>Sin cobros por confirmar</EmptyTitle>
              <EmptyDescription>
                No hay cobros repetidos detectados en el correo.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        <div className="flex flex-col gap-2">
          {patterns.map((pattern) => (
            <RecurringPatternCard
              key={pattern.id}
              pattern={pattern}
              categories={categories}
              display={display}
              actions={
                <>
                  <Button
                    type="button"
                    size="sm"
                    disabled={confirmingId === pattern.id}
                    onClick={() => void confirm(pattern)}
                  >
                    {confirmingId === pattern.id ? (
                      <Spinner className="size-4" />
                    ) : (
                      <CheckIcon className="size-4 shrink-0" />
                    )}
                    Confirmar
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Descartar"
                    disabled={updateMutation.isPending}
                    onClick={() => void dismiss(pattern)}
                  >
                    <XIcon className="size-4 shrink-0" />
                  </Button>
                </>
              }
            />
          ))}
        </div>
        <InfiniteListSentinel
          hasNextPage={recurringQuery.hasNextPage}
          isFetchingNextPage={recurringQuery.isFetchingNextPage}
          onLoadMore={() => void recurringQuery.fetchNextPage()}
        />
      </BottomSheet>

      <RecurringArchiveSheet
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        display={display}
        nested
      />
    </>
  )
}
