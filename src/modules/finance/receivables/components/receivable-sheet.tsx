"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceDetailsDisclosure,
  FinanceHelpText,
  FinanceSegmentedControl,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  useCreateReceivable,
  useDeleteReceivable,
  useUpdateReceivable,
} from "@/src/modules/finance/shared/hooks/use-receivables"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { formatPlanningDate } from "@/src/modules/finance/shared/lib/planning-lists"
import { buildReceivableBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import type {
  FinanceReceivable,
  FinanceReceivableStatus,
} from "@/src/modules/finance/shared/types/entities"
import {
  FINANCE_RECEIVABLE_STATUS_LABEL,
  FINANCE_RECEIVABLE_STATUSES,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
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
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArchiveIcon,
  CalendarIcon,
  HandshakeIcon,
  NotebookPenIcon,
  Trash2Icon,
  UserIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  receivableSchema,
  type ReceivableFormValues,
} from "@/src/modules/finance/receivables/lib/receivable-form"

const STATUS_OPTIONS = FINANCE_RECEIVABLE_STATUSES.map((value) => ({
  value,
  label: FINANCE_RECEIVABLE_STATUS_LABEL[value],
}))

function toFormValues(
  receivable: FinanceReceivable | null,
  defaultCurrency: string
): ReceivableFormValues {
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
  const deleteMutation = useDeleteReceivable()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ReceivableFormValues>({
    resolver: zodResolver(receivableSchema),
    defaultValues: toFormValues(receivable, defaultCurrency),
  })

  const currency = useWatch({ control, name: "currency" })
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "currency"
  >("none")

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
    const payload = buildReceivableBody(values, { isUpdate: isEdit })
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

  async function onArchiveReceivable() {
    if (!receivable) {
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: receivable.id,
        body: { status: "CANCELLED" },
      })
      appToast.success({ text1: "Cobro archivado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onDelete() {
    if (!receivable) {
      return
    }
    try {
      await deleteMutation.mutateAsync(receivable.id)
      appToast.success({ text1: "Cobro borrado" })
      setConfirmOpen(false)
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        pending={pending}
        title={isEdit ? "Editar cobro" : "Nuevo cobro"}
        description="Pagado sin cobrado deja que el API complete el monto."
        actions={{
          delete: isEdit ? (
            <div className="flex gap-2">
              {receivable?.status !== "CANCELLED" ? (
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive"
                  disabled={isPending}
                  onClick={() => void onArchiveReceivable()}
                >
                  <ArchiveIcon className="size-4 shrink-0" />
                  Archivar
                </Button>
              ) : null}
              <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2Icon className="size-4 shrink-0" />
                Borrar
              </Button>
            </div>
          ) : undefined,
          close: (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4 shrink-0" />
              Cancelar
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
          <Controller
            control={control}
            name="debtorName"
            render={({ field }) => (
              <FormTextField
                icon={UserIcon}
                label="Deudor"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.debtorName?.message}
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
        </SummarySection>

        <SummarySection title="Montos" icon={WalletIcon}>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <FinanceMoneyField
                label="Monto"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("amount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.amount?.message}
                currency={currency || defaultCurrency}
                onCurrencyPress={() => openPicker("currency")}
              />
            )}
          />
          <Controller
            control={control}
            name="paidAmount"
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <FinanceMoneyField
                  label="Cobrado"
                  amount={field.value}
                  onAmountChange={field.onChange}
                  onAmountCommit={(next) => {
                    field.onChange(next)
                    void trigger("paidAmount")
                  }}
                  onAmountBlur={field.onBlur}
                  amountError={errors.paidAmount?.message}
                  currency={currency || defaultCurrency}
                  disabled={isEdit}
                />
                <FinanceHelpText>
                  {isEdit
                    ? "Se actualiza al registrar cada cobro."
                    : "Si supera el monto, el API responde 400. Cancelado admite cobro parcial."}
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
                icon={NotebookPenIcon}
                label="Descripción"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </FinanceDetailsDisclosure>
      </BottomSheet>

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={currency || defaultCurrency}
        onSelect={(next) =>
          setValue("currency", next, { shouldValidate: true })
        }
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) {
            setConfirmOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este cobro?</AlertDialogTitle>
            <AlertDialogDescription>
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void onDelete()}
            >
              Borrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
