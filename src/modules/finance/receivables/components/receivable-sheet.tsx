"use client"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  useCreateReceivable,
  useUpdateReceivable,
} from "@/src/modules/finance/shared/hooks/use-receivables"
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
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
import { SheetBody } from "@/src/shared/components/sheets/sheet-body"
import { SheetHeader } from "@/src/shared/components/sheets/sheet-header"
import { SHEET_FOOTER_CLASS } from "@/src/shared/components/sheets/sheet-layout"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
import { Button } from "@/src/shared/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/src/shared/components/ui/drawer"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  CalendarIcon,
  HandshakeIcon,
  NotebookPenIcon,
  UserIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
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
  const isPending = createMutation.isPending || updateMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isDirty },
  } = useForm<ReceivableFormValues>({
    resolver: zodResolver(receivableSchema),
    defaultValues: toFormValues(receivable, defaultCurrency),
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
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

  return (
    <>
      <Drawer open={open} onOpenChange={requestOpenChange}>
        <DrawerContent>
          <SheetHeader
            title={isEdit ? "Editar cobro" : "Nuevo cobro"}
            description="Al marcarlo Pagado se completa el monto con lo que falte."
            pending={pending}
            actions={
              <SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.receivable} />
            }
          />
          <SheetBody pending={pending}>
            <SummarySection title="Cobro" icon={HandshakeIcon}>
              <Controller
                control={control}
                name="debtorName"
                render={({ field }) => (
                  <Field
                    data-invalid={errors.debtorName ? true : undefined}
                    className="gap-0.5"
                  >
                    <FieldLabel
                      htmlFor="receivable-debtor"
                      className="pl-2 text-sm text-muted-foreground"
                    >
                      Deudor
                    </FieldLabel>
                    <InputGroup className="h-10 overflow-hidden px-1">
                      <InputGroupAddon align="inline-start">
                        <UserIcon className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="receivable-debtor"
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        aria-invalid={errors.debtorName ? true : undefined}
                      />
                    </InputGroup>
                    {errors.debtorName?.message ? (
                      <FieldError>{errors.debtorName.message}</FieldError>
                    ) : null}
                  </Field>
                )}
              />
              {isEdit ? (
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Field className="gap-1">
                      <FieldLabel>Estado</FieldLabel>
                      <ToggleGroup
                        value={[field.value]}
                        onValueChange={(next) => {
                          if (next.length > 0) {
                            field.onChange(next[0])
                          }
                        }}
                        variant="outline"
                        size="sm"
                        aria-label="Estado"
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <ToggleGroupItem
                            key={option.value}
                            value={option.value}
                            className="rounded-full"
                          >
                            {option.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </Field>
                  )}
                />
              ) : null}
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Field
                    data-invalid={errors.description ? true : undefined}
                    className="gap-0.5"
                  >
                    <FieldLabel
                      htmlFor="receivable-concept"
                      className="pl-2 text-sm text-muted-foreground"
                    >
                      Concepto
                    </FieldLabel>
                    <InputGroup className="h-10 overflow-hidden px-1">
                      <InputGroupAddon align="inline-start">
                        <NotebookPenIcon className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="receivable-concept"
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        aria-invalid={errors.description ? true : undefined}
                      />
                    </InputGroup>
                    {errors.description?.message ? (
                      <FieldError>{errors.description.message}</FieldError>
                    ) : null}
                  </Field>
                )}
              />
            </SummarySection>

            <SummarySection title="Montos" icon={WalletIcon}>
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <FinanceMoneyField
                    calculatorKey="receivable-amount"
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
                      calculatorKey="receivable-collected"
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
                    <FieldDescription className="text-xs">
                      {isEdit
                        ? "Se actualiza al registrar cada cobro."
                        : "No puede superar el monto. Cancelado admite cobro parcial."}
                    </FieldDescription>
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
          </SheetBody>
          {!pending ? (
            <DrawerFooter className={SHEET_FOOTER_CLASS}>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => requestOpenChange(false)}
              >
                <XIcon className="size-4 shrink-0" aria-hidden="true" />
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isPending}
                className="flex-1"
                onClick={onSubmit}
              >
                {isPending ? <Spinner data-icon="inline-start" /> : null}
                Guardar
              </Button>
            </DrawerFooter>
          ) : null}
        </DrawerContent>
        <FinanceCurrencyPickerSheet
          open={picker === "currency"}
          onOpenChange={closeHandlerFor("currency")}
          value={currency || defaultCurrency}
          onSelect={(next) =>
            setValue("currency", next, { shouldValidate: true })
          }
        />
      </Drawer>

      {discardChangesDialog}
    </>
  )
}
