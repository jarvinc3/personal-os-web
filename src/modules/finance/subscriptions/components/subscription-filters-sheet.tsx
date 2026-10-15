"use client"

import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { FinanceErrorState } from "@/src/modules/finance/shared/components/layout/error-state"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { usePicker } from "@/src/shared/hooks/use-picker"
import {
  EMPTY_SUBSCRIPTION_FILTERS,
  SUBSCRIPTION_FREQUENCY_LABEL,
  SUBSCRIPTION_SORT_LABEL,
  subscriptionMethodLabel,
  type SubscriptionFilters,
} from "@/src/modules/finance/subscriptions/lib/subscription-filters"
import { SubscriptionSortSheet } from "@/src/modules/finance/subscriptions/components/subscription-sort-sheet"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
  FinanceSubscriptionStatus,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import {
  ArrowDownWideNarrowIcon,
  CreditCardIcon,
  EraserIcon,
  ListFilterIcon,
  SearchIcon,
  TagsIcon,
} from "lucide-react"

const STATUS_OPTIONS: {
  value: "ALL" | FinanceSubscriptionStatus
  label: string
}[] = [
  { value: "ALL", label: "Todas" },
  { value: "ACTIVE", label: "Activas" },
  { value: "PAUSED", label: "Pausadas" },
  { value: "CANCELLED", label: "Canceladas" },
]

const FREQUENCY_OPTIONS: {
  value: SubscriptionFilters["frequency"]
  label: string
}[] = [
  { value: "ALL", label: "Todas" },
  { value: "MONTHLY", label: SUBSCRIPTION_FREQUENCY_LABEL.MONTHLY },
  { value: "YEARLY", label: SUBSCRIPTION_FREQUENCY_LABEL.YEARLY },
  { value: "OTHER", label: SUBSCRIPTION_FREQUENCY_LABEL.OTHER },
]

type SubscriptionFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: SubscriptionFilters
  onChange: (next: SubscriptionFilters) => void
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  institutions: FinanceInstitution[]
  display: FinanceMoneyDisplay
  /** Rows the current filters return, for the footer button. */
  resultCount: number
  hasMore: boolean
  error: unknown
  isRetrying: boolean
  onRetry: () => void
}

/**
 * Bottom sheet with the list filters: real pickers for the payment method and
 * the categories, segmented controls for status and frequency, and the order.
 */
export function SubscriptionFiltersSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  accounts,
  cards,
  institutions,
  display,
  resultCount,
  hasMore,
  error,
  isRetrying,
  onRetry,
}: SubscriptionFiltersSheetProps) {
  const categoriesQuery = useCategories(open)
  const categories = categoriesQuery.data ?? []
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "destination" | "category" | "sort"
  >("none")
  const methodLabel = subscriptionMethodLabel({
    method: filters.method,
    accounts,
    cards,
  })
  const categoryLabel =
    filters.categoryIds.length === 0
      ? "Todas"
      : filters.categoryIds.length === 1
        ? (categories.find((item) => item.id === filters.categoryIds[0])
            ?.name ?? "1 categoría")
        : `${filters.categoryIds.length} categorías`

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Filtros"
        actions={{
          close: (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onChange(EMPTY_SUBSCRIPTION_FILTERS)}
            >
              <EraserIcon className="size-4 shrink-0" />
              Limpiar
            </Button>
          ),
          submit: (
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              <ListFilterIcon className="size-4 shrink-0" />
              Ver {resultCount}
              {hasMore ? "+" : ""} resultado{resultCount === 1 ? "" : "s"}
            </Button>
          ),
        }}
      >
        <FormTextField
          label="Buscar"
          icon={SearchIcon}
          type="search"
          value={filters.q}
          onChange={(value) => onChange({ ...filters, q: value })}
          placeholder="Buscar suscripción"
        />
        <FinanceSegmentedControl
          label="Estado"
          value={filters.status}
          onChange={(value) => onChange({ ...filters, status: value })}
          options={STATUS_OPTIONS}
          fullWidth
        />
        <FinanceSegmentedControl
          label="Frecuencia"
          value={filters.frequency}
          onChange={(value) => onChange({ ...filters, frequency: value })}
          options={FREQUENCY_OPTIONS}
          fullWidth
        />
        <SettingsSection title="Filtros">
          <SettingsRow
            icon={CreditCardIcon}
            label="Método de pago"
            value={methodLabel ?? "Todos"}
            showChevron
            onPress={() => openPicker("destination")}
          />
          <SettingsRow
            icon={TagsIcon}
            label="Categoría"
            value={categoryLabel}
            showChevron
            onPress={() => openPicker("category")}
          />
          <SettingsRow
            icon={ArrowDownWideNarrowIcon}
            label="Ordenar por"
            value={SUBSCRIPTION_SORT_LABEL[filters.sort]}
            showChevron
            isLast
            onPress={() => openPicker("sort")}
          />
        </SettingsSection>
        {error ? (
          <FinanceErrorState
            message={financeErrorMessage(error)}
            onRetry={onRetry}
            isRetrying={isRetrying}
          />
        ) : null}
      </BottomSheet>

      <DestinationPickerSheet
        open={picker === "destination"}
        onOpenChange={closeHandlerFor("destination")}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={display}
        onSelect={(next) => onChange({ ...filters, method: next })}
      />

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType="EXPENSE"
        multiple
        value={filters.categoryIds}
        onChange={(categoryIds) => onChange({ ...filters, categoryIds })}
      />

      <SubscriptionSortSheet
        open={picker === "sort"}
        onOpenChange={closeHandlerFor("sort")}
        value={filters.sort}
        onChange={(sort) => onChange({ ...filters, sort })}
      />
    </>
  )
}
