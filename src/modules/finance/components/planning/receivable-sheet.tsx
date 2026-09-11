"use client"

import { FinanceCurrencyPills } from "@/src/modules/finance/components/forms/finance-currency-pills"
import { FinanceDateField } from "@/src/modules/finance/components/forms/finance-date-field"
import {
  FinanceAmountField,
  FinanceDetailsDisclosure,
  FinanceHelpText,
  FinanceSegmentedControl,
} from "@/src/modules/finance/components/forms/finance-form-blocks"
import {
  useCreateReceivable,
  useUpdateReceivable,
} from "@/src/modules/finance/hooks/use-receivables"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { formatPlanningDate } from "@/src/modules/finance/lib/planning-lists"
import { buildCreateReceivableBody } from "@/src/modules/finance/lib/planning-payloads"
import type {
  FinanceReceivable,
  FinanceReceivableStatus,
} from "@/src/modules/finance/types/entities"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  FINANCE_RECEIVABLE_STATUSES,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, HandshakeIcon, WalletIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  debtorName: z.string().trim().min(1, "Deudor obligatorio").max(120),
  description: z.string(),
  amount: z.string().trim().min(1, "Monto obligatorio"),
  paidAmount: z.string(),
  status: z.enum(FINANCE_RECEIVABLE_STATUSES),
  currency: z.string().trim().min(3).max(3),
  dueDate: z.string(),
})

type FormValues = z.infer<typeof schema>

const STATUS_OPTIONS = FINANCE_RECEIVABLE_STATUSES.map((value) => ({
  value,
  label: FINANCE_RECEIVABLE_STATUS_LABEL[value],
}))

function toFormValues(
  receivable: FinanceReceivable | null,
  defaultCurrency: string
): FormValues {
  return {
    debtorName: receivable?.debtorName ?? "",
    description: receivable?.description ?? "",
    amount: receivable?.amount ?? "",
    paidAmount: receivable?.paidAmount ?? "",
    status: receivable?.status ?? "PENDING",
    currency: receivable?.currency ?? defaultCurrency,
    dueDate: formatPlanningDate(receivable?.dueDate),
  }
}

type ReceivableSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receivable: FinanceReceivable | null
  defaultCurrency: string
  pending?: boolean
}

export function ReceivableSheet({
  open,
  onOpenChange,
  receivable,
  defaultCurrency,
  pending = false,
}: ReceivableSheetProps) {
  const isEdit = Boolean(receivable)
  const createMutation = useCreateReceivable()
  const updateMutation = useUpdateReceivable()
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(receivable, defaultCurrency),
  })

  useEffect(() => {
    if (open) {
      reset(toFormValues(receivable, defaultCurrency))
    }
  }, [open, receivable, defaultCurrency, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateReceivableBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (receivable) {
        await updateMutation.mutateAsync({
          id: receivable.id,
          body: payload.body,
        })
        appToast.success({ text1: "Cobro actualizado" })
      } else {
        await createMutation.mutateAsync(payload.body)
        appToast.success({ text1: "Cobro creado" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onMarkPaid() {
    if (!receivable) return
    try {
      await updateMutation.mutateAsync({
        id: receivable.id,
        body: { status: "PAID" },
      })
      appToast.success({ text1: "Cobro marcado como pagado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onCancelReceivable() {
    if (!receivable) return
    const confirmed = window.confirm(
      "¿Marcar este cobro como cancelado? No se elimina."
    )
    if (!confirmed) return
    try {
      await updateMutation.mutateAsync({
        id: receivable.id,
        body: { status: "CANCELLED" },
      })
      appToast.success({ text1: "Cobro cancelado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title={isEdit ? "Editar cobro" : "Nuevo cobro"}
      description="Pagado sin cobrado deja que el API complete el monto. No hay eliminar: usa Cancelado."
      actions={{
        delete:
          isEdit && receivable?.status !== "CANCELLED" ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => void onCancelReceivable()}
            >
              Cancelar cobro
            </Button>
          ) : undefined,
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        ),
        submit: (
          <Button
            type="button"
            disabled={isPending}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Cobro" icon={HandshakeIcon}>
        {isEdit && receivable?.status !== "PAID" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => void onMarkPaid()}
          >
            Marcar pagado
          </Button>
        ) : null}
        <Controller
          control={control}
          name="debtorName"
          render={({ field }) => (
            <FormTextField
              label="Deudor"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.debtorName?.message}
              placeholder="Nombre"
            />
          )}
        />
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <FinanceSegmentedControl
              label="Estado"
              value={field.value}
              onChange={(value) =>
                field.onChange(value as FinanceReceivableStatus)
              }
              options={STATUS_OPTIONS}
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <FinanceCurrencyPills
              value={field.value}
              onChange={field.onChange}
              baseCurrency={defaultCurrency}
              extraCodes={[defaultCurrency, receivable?.currency ?? ""]}
            />
          )}
        />
      </SummarySection>

      <SummarySection title="Montos" icon={WalletIcon}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <FinanceAmountField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.amount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="paidAmount"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <FormTextField
                label="Cobrado"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.paidAmount?.message}
                placeholder="Vacío si Pagado (el API completa)"
              />
              <FinanceHelpText>
                Si supera el monto, el API responde 400. Cancelado admite cobro
                parcial.
              </FinanceHelpText>
            </div>
          )}
        />
      </SummarySection>

      <SummarySection title="Fecha" icon={CalendarIcon}>
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <FinanceDateField
              label="Vencimiento"
              value={field.value}
              onChange={field.onChange}
              optional
            />
          )}
        />
      </SummarySection>

      <FinanceDetailsDisclosure>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormTextField
              label="Descripción"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </FinanceDetailsDisclosure>
    </BottomSheet>
  )
}
