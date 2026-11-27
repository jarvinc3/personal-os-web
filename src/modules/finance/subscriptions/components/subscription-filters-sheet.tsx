"use client"

import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { ErrorState } from "@/src/shared/components/feedback/error-state"
import { useAccounts } from "@/src/modules/finance/shared/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/shared/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useInstitutions } from "@/src/modules/finance/shared/hooks/use-institutions"
import { useSubscriptions } from "@/src/modules/finance/shared/hooks/use-subscriptions"
import { infiniteListItems } from "@/src/modules/finance/shared/lib/finance-query-options"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { usePicker } from "@/src/shared/hooks/use-picker"
import {
  EMPTY_SUBSCRIPTION_FILTERS,
  SUBSCRIPTION_FREQUENCY_LABEL,
  SUBSCRIPTION_SORT_LABEL,
  subscriptionListQuery,
  subscriptionMethodLabel,
  type SubscriptionFilters,
} from "@/src/modules/finance/subscriptions/lib/subscription-filters"
import { SubscriptionSortSheet } from "@/src/modules/finance/subscriptions/components/subscription-sort-sheet"
import type { FinanceSubscriptionStatus } from "@/src/modules/finance/shared/types/entities"
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/settings/settings-section"
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
  isEnabled: boolean
  filters: SubscriptionFilters
  onChange: (next: SubscriptionFilters) => void
  display: FinanceMoneyDisplay
}

/**
 * Bottom sheet with the list filters: real pickers for the payment method and
 * the categories, segmented controls for status and frequency, and the order.
 * Applies each change as it happens, so the footer count is the list behind.
 */
export function SubscriptionFiltersSheet({
  open,
  onOpenChange,
  isEnabled,
  filters,
  onChange,
  display,
}: SubscriptionFiltersSheetProps) {
  const categoriesQuery = useCategories(open)
  const accountsQuery = useAccounts(open)
  const cardsQuery = useCards(open)
  const institutionsQuery = useInstitutions(open)
  const previewQuery = useSubscriptions(
    isEnabled && open,
    subscriptionListQuery(filters)
  )
  const categories = categoriesQuery.data ?? []
  const accounts = accountsQuery.data ?? []
  const cards = cardsQuery.data ?? []
  const institutions = institutionsQuery.data ?? []
  const resultCount = infiniteListItems(previewQuery.data).length
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
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <SheetHeader title="Filtros" />
          <SheetBody>
            <Field className="gap-0.5">
              <FieldLabel
                htmlFor="subscription-search"
                className="pl-2 text-sm text-muted-foreground"
              >
                Buscar
              </FieldLabel>
              <InputGroup className="h-10 overflow-hidden px-1">
                <InputGroupAddon align="inline-start">
                  <SearchIcon className="text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="subscription-search"
                  type="search"
                  value={filters.q}
                  onChange={(event) =>
                    onChange({ ...filters, q: event.target.value })
                  }
                  placeholder="Buscar suscripción"
                />
              </InputGroup>
            </Field>
            <Field className="gap-1">
              <FieldLabel>Estado</FieldLabel>
              <ToggleGroup
                value={[filters.status]}
                onValueChange={(next) => {
                  if (next.length > 0) {
                    onChange({ ...filters, status: next[0] })
                  }
                }}
                variant="outline"
                size="sm"
                aria-label="Estado"
                className="w-full"
              >
                {STATUS_OPTIONS.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-11 flex-1 rounded-full text-base"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
            <Field className="gap-1">
              <FieldLabel>Frecuencia</FieldLabel>
              <ToggleGroup
                value={[filters.frequency]}
                onValueChange={(next) => {
                  if (next.length > 0) {
                    onChange({ ...filters, frequency: next[0] })
                  }
                }}
                variant="outline"
                size="sm"
                aria-label="Frecuencia"
                className="w-full"
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-11 flex-1 rounded-full text-base"
                  >
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
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
            {previewQuery.error ? (
              <ErrorState
                message={financeErrorMessage(previewQuery.error)}
                onRetry={() => void previewQuery.refetch()}
                isRetrying={previewQuery.isFetching}
              />
            ) : null}
          </SheetBody>
          <DrawerFooter className={SHEET_FOOTER_CLASS}>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onChange(EMPTY_SUBSCRIPTION_FILTERS)}
            >
              <EraserIcon className="size-4 shrink-0" />
              Limpiar
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              <ListFilterIcon className="size-4 shrink-0" />
              Ver {resultCount}
              {previewQuery.hasNextPage ? "+" : ""} resultado
              {resultCount === 1 ? "" : "s"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
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
      </Drawer>
    </>
  )
}
