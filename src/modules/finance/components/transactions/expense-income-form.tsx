"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useCategories } from "@/src/modules/finance/hooks/use-categories"
import { useCreateTransaction } from "@/src/modules/finance/hooks/use-transactions"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  buildCreateTransactionBody,
  buildLedgerTargetOptions,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import type { FinanceTransactionType } from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarIcon,
  DollarSignIcon,
  FileTextIcon,
  StickyNoteIcon,
  StoreIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const expenseIncomeSchema = z.object({
  merchant: z.string().max(200, "Máximo 200 caracteres"),
  categoryId: z.string(),
  amount: z.string().trim().min(1, "Monto obligatorio"),
  currency: z.string().trim().length(3, "Moneda inválida"),
  destination: z.string().min(1, "Selecciona una cuenta o tarjeta"),
  transactionDate: z.string().trim().min(1, "Fecha obligatoria"),
  description: z.string(),
  notes: z.string(),
  isPaid: z.boolean(),
})

type ExpenseIncomeFormValues = z.infer<typeof expenseIncomeSchema>
type ExpenseIncomeType = Exclude<FinanceTransactionType, "TRANSFER">

type ExpenseIncomeFormProps = {
  type: ExpenseIncomeType
  open: boolean
  onOpenChange: (open: boolean) => void
  enabled: boolean
  defaultCurrency: string
}

function todayDateInput(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

export default function ExpenseIncomeForm({
  type,
  open,
  onOpenChange,
  enabled,
  defaultCurrency,
}: ExpenseIncomeFormProps) {
  const accountsQuery = useAccounts(enabled && open)
  const cardsQuery = useCards(enabled && open)
  const categoriesQuery = useCategories(enabled && open)
  const createMutation = useCreateTransaction()

  const destinationOptions = useMemo(
    () =>
      buildLedgerTargetOptions(
        accountsQuery.data ?? [],
        cardsQuery.data ?? [],
      ),
    [accountsQuery.data, cardsQuery.data],
  )
  const categoryOptions = useMemo(
    () => [
      { value: CATALOG_NONE, label: "Sin categoría" },
      ...(categoriesQuery.data ?? []).map((category) => ({
        value: category.id,
        label: `${category.icon ? `${category.icon} ` : ""}${category.name}`,
      })),
    ],
    [categoriesQuery.data],
  )

  const { control, handleSubmit, reset } = useForm<ExpenseIncomeFormValues>({
    resolver: zodResolver(expenseIncomeSchema),
    defaultValues: {
      merchant: "",
      categoryId: CATALOG_NONE,
      amount: "",
      currency: defaultCurrency,
      destination: CATALOG_NONE,
      transactionDate: todayDateInput(),
      description: "",
      notes: "",
      isPaid: true,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      merchant: "",
      categoryId: CATALOG_NONE,
      amount: "",
      currency: defaultCurrency,
      destination: destinationOptions[1]?.value ?? CATALOG_NONE,
      transactionDate: todayDateInput(),
      description: "",
      notes: "",
      isPaid: true,
    })
  }, [open, type, defaultCurrency, destinationOptions, reset])

  const submit = handleSubmit(async (values) => {
    const target = splitLedgerTarget(values.destination)
    const payload = buildCreateTransactionBody({
      ...values,
      ...target,
      type,
      status: values.isPaid ? "CONFIRMED" : "PENDING",
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }

    try {
      await createMutation.mutateAsync(payload.body)
      appToast.success({
        text1: type === "DEBIT" ? "Gasto registrado" : "Ingreso registrado",
      })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  const title = type === "DEBIT" ? "Nuevo gasto" : "Nuevo ingreso"
  const hasTargets =
    (accountsQuery.data?.length ?? 0) > 0 ||
    (cardsQuery.data?.length ?? 0) > 0

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Registra los datos principales del movimiento."
      actions={{
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={createMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            type="button"
            className="flex-1"
            disabled={createMutation.isPending || !hasTargets}
            onClick={submit}
          >
            {createMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <div className="flex flex-col gap-4">
        <Controller
          control={control}
          name="merchant"
          render={({ field, fieldState }) => (
            <FormTextField
              label={type === "DEBIT" ? "Comercio" : "Origen"}
              icon={StoreIcon}
              placeholder={
                type === "DEBIT" ? "Nombre del comercio" : "Origen del ingreso"
              }
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        {type === "DEBIT" ? (
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <SelectField
                label="Categoría"
                value={field.value}
                onChange={field.onChange}
                options={categoryOptions}
              />
            )}
          />
        ) : null}

        <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-3">
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <FormTextField
                label="Monto"
                icon={DollarSignIcon}
                type="number"
                placeholder="0.00"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <CurrencySelectField
                label="Moneda"
                value={field.value}
                onChange={field.onChange}
                enabled={enabled && open}
                extraCodes={[defaultCurrency]}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="destination"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <SelectField
                label="Cuenta o tarjeta"
                value={field.value}
                onChange={field.onChange}
                options={destinationOptions}
                disabled={!hasTargets}
              />
              {fieldState.error?.message ? (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              ) : null}
            </div>
          )}
        />

        <Controller
          control={control}
          name="transactionDate"
          render={({ field, fieldState }) => (
            <FormTextField
              label="Fecha"
              icon={CalendarIcon}
              type="date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormTextField
              label="Descripción"
              icon={FileTextIcon}
              placeholder="Opcional"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormTextField
              label="Notas"
              icon={StickyNoteIcon}
              placeholder="Opcional"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="isPaid"
          render={({ field }) => (
            <SwitchFieldRow
              label={type === "DEBIT" ? "Pagado" : "Recibido"}
              description={
                field.value
                  ? "El movimiento se registrará como completado"
                  : "El movimiento quedará pendiente"
              }
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        {!hasTargets &&
        !accountsQuery.isPending &&
        !cardsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">
            Crea una cuenta o tarjeta para poder guardar el movimiento.
          </p>
        ) : null}
      </div>
    </BottomSheet>
  )
}
