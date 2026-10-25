"use client"

import { z } from "zod"

import { CategoryTrigger } from "@/src/modules/finance/shared/components/pickers/category-trigger"
import { CategoryPickerSheet } from "@/src/modules/finance/shared/components/pickers/category-picker-sheet"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { useCategories } from "@/src/modules/finance/shared/hooks/use-categories"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import {
  useCreateRecurring,
  useUpdateRecurring,
} from "@/src/modules/finance/shared/hooks/use-recurring"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { sliceDateTimeInput } from "@/src/modules/finance/shared/lib/ledger-form"
import { useFinanceAmountEntry } from "@/src/modules/finance/shared/hooks/use-finance-amount-entry"
import { RECURRING_KIND_LABEL } from "@/src/modules/finance/subscriptions/lib/recurring-display"
import type {
  FinanceRecurringKind,
  FinanceRecurringPattern,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { FormTextField } from "@/src/shared/components/forms/form-text-field"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon, RepeatIcon, SaveIcon, StoreIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"

const recurringSchema = z.object({
  merchant: z.string().trim().min(1, "Nombre obligatorio").max(160),
  amount: z
    .string()
    .trim()
    .refine((value) => Number(value.replace(",", ".")) > 0, {
      message: "Monto mayor que cero",
    }),
  currency: z.string().trim().min(3).max(3),
  frequency: z.enum(["7", "14", "30", "365"]),
  nextExpectedDate: z.string().min(1, "Fecha obligatoria"),
  kind: z.enum(["SUBSCRIPTION", "BILL", "INCOME", "OTHER"]),
  categoryId: z.string(),
})

type RecurringFormValues = z.infer<typeof recurringSchema>

const FREQUENCY_OPTIONS = [
  { value: "7" as const, label: "Semanal" },
  { value: "14" as const, label: "Quincenal" },
  { value: "30" as const, label: "Mensual" },
  { value: "365" as const, label: "Anual" },
]

const KIND_OPTIONS = (
  ["SUBSCRIPTION", "BILL", "INCOME", "OTHER"] as FinanceRecurringKind[]
).map((kind) => ({ value: kind, label: RECURRING_KIND_LABEL[kind] }))

function todayInput(): string {
  return new Date().toISOString().slice(0, 10)
}

function toFormValues(
  pattern: FinanceRecurringPattern | null,
  defaultCurrency: string
): RecurringFormValues {
  return {
    merchant: pattern?.merchantName ?? pattern?.merchant ?? "",
    amount: pattern?.avgAmount ?? "",
    currency: pattern?.currency ?? defaultCurrency,
    frequency: String(
      pattern?.frequency ?? 30
    ) as RecurringFormValues["frequency"],
    nextExpectedDate: pattern
      ? sliceDateTimeInput(pattern.nextExpectedDate).slice(0, 10)
      : todayInput(),
    kind: pattern?.kind ?? "SUBSCRIPTION",
    categoryId: pattern?.categoryId ?? CATALOG_NONE,
  }
}

type RecurringSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pattern: FinanceRecurringPattern | null
  defaultCurrency: string
}

export function RecurringSheet({
  open,
  onOpenChange,
  pattern,
  defaultCurrency,
}: RecurringSheetProps) {
  const isEdit = Boolean(pattern)
  const categoriesQuery = useCategories(open)
  const categories = categoriesQuery.data ?? []
  const createMutation = useCreateRecurring()
  const updateMutation = useUpdateRecurring()
  const { amountEntry, setAmountEntry } = useFinanceAmountEntry()
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "category" | "currency"
  >("none")

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: toFormValues(pattern, defaultCurrency),
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })

  useEffect(() => {
    if (open) {
      reset(toFormValues(pattern, defaultCurrency))
    }
  }, [open, pattern, defaultCurrency, reset])

  const currency = useWatch({ control, name: "currency" })
  const categoryId = useWatch({ control, name: "categoryId" })
  const selectedCategory =
    categories.find((category) => category.id === categoryId) ?? null
  const isPending = createMutation.isPending || updateMutation.isPending

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const body = {
      merchant: values.merchant.trim(),
      avgAmount: Number(values.amount.replace(",", ".")),
      currency: values.currency.toUpperCase(),
      frequency: Number(values.frequency),
      nextExpectedDate: values.nextExpectedDate,
      kind: values.kind,
      categoryId: values.categoryId === CATALOG_NONE ? null : values.categoryId,
    }
    try {
      if (pattern) {
        await updateMutation.mutateAsync({ id: pattern.id, body })
        appToast.success({ text1: "Recurrente actualizado" })
      } else {
        await createMutation.mutateAsync(body)
        appToast.success({ text1: "Recurrente creado" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={requestOpenChange}
        pending={isPending}
        title={isEdit ? "Editar recurrente" : "Nuevo recurrente"}
        description={
          isEdit
            ? "Ajusta el monto, la periodicidad o el próximo cobro."
            : "Sirve para un cobro fijo (renta, un préstamo) que no quieres esperar a que se detecte."
        }
        actions={{
          close: (
            <Button
              key="cancel"
              variant="outline"
              className="flex-1"
              onClick={() => requestOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
            </Button>
          ),
          submit: (
            <Button
              key="submit"
              className="flex-1"
              disabled={isPending}
              onClick={onSubmit}
            >
              {isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <SaveIcon className="size-4 shrink-0" />
              )}
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          ),
        }}
      >
        <SummarySection title="Cobro" icon={RepeatIcon}>
          <Controller
            control={control}
            name="merchant"
            render={({ field }) => (
              <FormTextField
                label="Comercio o concepto"
                icon={StoreIcon}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.merchant?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <FinanceMoneyField
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={field.onChange}
                amountError={errors.amount?.message}
                currency={currency || defaultCurrency}
                currencyError={errors.currency?.message}
                onCurrencyPress={() => openPicker("currency")}
                disabled={isPending}
                entryMode={amountEntry}
                onEntryModeChange={setAmountEntry}
              />
            )}
          />

          <Controller
            control={control}
            name="frequency"
            render={({ field }) => (
              <FinanceSegmentedControl
                label="Periodicidad"
                value={field.value}
                onChange={field.onChange}
                options={FREQUENCY_OPTIONS}
              />
            )}
          />

          <Controller
            control={control}
            name="nextExpectedDate"
            render={({ field }) => (
              <FinanceDateField
                label="Próximo cobro"
                value={field.value}
                onChange={field.onChange}
                error={errors.nextExpectedDate?.message}
              />
            )}
          />
        </SummarySection>

        <SummarySection
          title="Detalles opcionales"
          icon={InfoIcon}
          collapsible
          defaultOpen={isEdit}
        >
          <Controller
            control={control}
            name="kind"
            render={({ field }) => (
              <FinanceSegmentedControl
                label="Tipo"
                value={field.value}
                onChange={field.onChange}
                options={KIND_OPTIONS}
              />
            )}
          />

          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Categoría
            </FieldLabel>
            <CategoryTrigger
              category={selectedCategory}
              onClick={() => openPicker("category")}
            />
            {errors.categoryId?.message ? (
              <FieldError>{errors.categoryId.message}</FieldError>
            ) : null}
          </Field>
        </SummarySection>
      </BottomSheet>

      <CategoryPickerSheet
        open={picker === "category"}
        onOpenChange={closeHandlerFor("category")}
        categories={categories}
        categoryType="EXPENSE"
        onSelect={(next) => setValue("categoryId", next, { shouldDirty: true })}
      />

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        onSelect={(next) =>
          setValue("currency", next, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />

      {discardChangesDialog}
    </>
  )
}
