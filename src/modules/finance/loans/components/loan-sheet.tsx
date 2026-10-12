"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import {
  FinanceDetailsDisclosure,
  FinanceHelpText,
  FinanceSegmentedControl,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  InstitutionPickerSheet,
  InstitutionTrigger,
} from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  useArchiveLoan,
  useCreateLoan,
  useDeleteLoan,
  useUpdateLoan,
} from "@/src/modules/finance/shared/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { rateFractionToPercent } from "@/src/modules/finance/shared/lib/interest-rate"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatPlanningDate } from "@/src/modules/finance/shared/lib/planning-lists"
import { buildLoanBody } from "@/src/modules/finance/shared/lib/planning-payloads"
import type {
  FinanceAccount,
  FinanceInstallmentFreq,
  FinanceInstitution,
  FinanceLoan,
} from "@/src/modules/finance/shared/types/entities"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  FINANCE_INSTALLMENT_FREQS,
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
import { Field, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArchiveIcon,
  CalendarIcon,
  HashIcon,
  LandmarkIcon,
  NotebookPenIcon,
  PercentIcon,
  Trash2Icon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  loanSchema,
  type LoanFormValues,
} from "@/src/modules/finance/loans/lib/loan-form"

const FREQ_OPTIONS = FINANCE_INSTALLMENT_FREQS.map((value) => ({
  value,
  label: FINANCE_INSTALLMENT_FREQ_LABEL[value],
}))

function toFormValues(
  loan: FinanceLoan | null,
  defaultCurrency: string,
  defaultInstitutionId: string = CATALOG_NONE
): LoanFormValues {
  return {
    lenderName: loan?.lenderName ?? "",
    institutionId: loan?.institutionId ?? defaultInstitutionId,
    accountId: loan?.accountId ?? CATALOG_NONE,
    originalAmount: loan?.originalAmount ?? "",
    currentBalance: loan?.currentBalance ?? "",
    installmentAmount: loan?.installmentAmount ?? "",
    installmentFreq: loan?.installmentFreq ?? "MONTHLY",
    totalInstallments: loan ? String(loan.totalInstallments) : "",
    paidInstallments: loan ? String(loan.paidInstallments) : "0",
    nextDueDate: formatPlanningDate(loan?.nextDueDate) || todayDateInput(),
    interestRatePercent: rateFractionToPercent(loan?.interestRate) ?? "",
    notes: loan?.notes ?? "",
    currency: loan?.currency ?? defaultCurrency,
  }
}

type LoanSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  loan: FinanceLoan | null
  accounts: FinanceAccount[]
  institutions: FinanceInstitution[]
  defaultCurrency: string
  defaultInstitutionId?: string
  display: FinanceMoneyDisplay
  pending?: boolean
}

export function LoanSheet({
  open,
  onOpenChange,
  loan,
  accounts,
  institutions,
  defaultCurrency,
  defaultInstitutionId,
  display,
  pending = false,
}: LoanSheetProps) {
  const isEdit = Boolean(loan)
  const createMutation = useCreateLoan()
  const updateMutation = useUpdateLoan()
  const archiveMutation = useArchiveLoan()
  const deleteMutation = useDeleteLoan()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending

  const resolvedDefaultInstitutionId = defaultInstitutionId ?? CATALOG_NONE

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: toFormValues(
      loan,
      defaultCurrency,
      resolvedDefaultInstitutionId
    ),
  })

  const selectedInstitutionId = useWatch({ control, name: "institutionId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })
  const currency = useWatch({ control, name: "currency" })
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "currency" | "institution" | "account"
  >("none")
  const selectedInstitution =
    institutions.find((item) => item.id === selectedInstitutionId) ?? null
  const pickerInstitutions =
    selectedInstitutionId === CATALOG_NONE
      ? institutions
      : institutions.filter((item) => item.id === selectedInstitutionId)

  const institutionAccounts = accounts.filter(
    (item) =>
      item.isActive &&
      (selectedInstitutionId === CATALOG_NONE ||
        item.institutionId === selectedInstitutionId)
  )

  useEffect(() => {
    if (open) {
      reset(toFormValues(loan, defaultCurrency, resolvedDefaultInstitutionId))
    }
  }, [open, loan, defaultCurrency, resolvedDefaultInstitutionId, reset])

  useEffect(() => {
    if (
      selectedAccountId !== CATALOG_NONE &&
      !accounts.some(
        (item) =>
          item.id === selectedAccountId &&
          item.isActive &&
          (selectedInstitutionId === CATALOG_NONE ||
            item.institutionId === selectedInstitutionId)
      )
    ) {
      setValue("accountId", CATALOG_NONE)
    }
  }, [accounts, selectedAccountId, selectedInstitutionId, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildLoanBody(
      {
        ...values,
        interestRatePercent: values.interestRatePercent,
      },
      { isUpdate: isEdit }
    )
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (loan) {
        await updateMutation.mutateAsync({ id: loan.id, body: payload.body })
        appToast.success({ text1: "Préstamo actualizado" })
      } else {
        await createMutation.mutateAsync(payload.body)
        appToast.success({ text1: "Préstamo creado" })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onArchive() {
    if (!loan) {
      return
    }
    try {
      await archiveMutation.mutateAsync(loan.id)
      appToast.success({ text1: "Préstamo archivado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onDelete() {
    if (!loan) {
      return
    }
    try {
      await deleteMutation.mutateAsync(loan.id)
      appToast.success({ text1: "Préstamo borrado" })
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
        title={isEdit ? "Editar préstamo" : "Nuevo préstamo"}
        actions={{
          delete: isEdit ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-destructive"
                disabled={isPending}
                onClick={() => void onArchive()}
              >
                <ArchiveIcon className="size-4 shrink-0" />
                Archivar
              </Button>
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
        <SummarySection title="Préstamo" icon={LandmarkIcon}>
          <Controller
            control={control}
            name="lenderName"
            render={({ field }) => (
              <FormTextField
                icon={LandmarkIcon}
                label="Prestamista"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.lenderName?.message}
                placeholder="Banco Popular"
              />
            )}
          />
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Institución (opcional)
            </FieldLabel>
            <InstitutionTrigger
              institution={selectedInstitution}
              placeholder="Prestamista externo"
              onClick={() => openPicker("institution")}
            />
          </Field>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Cuenta de pago (opcional)
                </FieldLabel>
                <DestinationTrigger
                  destination={
                    field.value
                      ? encodeLedgerTarget("account", field.value)
                      : CATALOG_NONE
                  }
                  accounts={institutionAccounts}
                  cards={[]}
                  display={display}
                  placeholder="Sin cuenta de pago"
                  onClick={() => openPicker("account")}
                />
              </Field>
            )}
          />
        </SummarySection>

        <SummarySection title="Montos" icon={WalletIcon}>
          <Controller
            control={control}
            name="originalAmount"
            render={({ field }) => (
              <FinanceMoneyField
                label="Monto original"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("originalAmount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.originalAmount?.message}
                currency={currency || defaultCurrency}
                onCurrencyPress={() => openPicker("currency")}
              />
            )}
          />
          <Controller
            control={control}
            name="currentBalance"
            render={({ field }) => (
              <FinanceMoneyField
                label="Saldo actual"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("currentBalance")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.currentBalance?.message}
                currency={currency || defaultCurrency}
              />
            )}
          />
          <Controller
            control={control}
            name="installmentAmount"
            render={({ field }) => (
              <FinanceMoneyField
                label="Cuota"
                amount={field.value}
                onAmountChange={field.onChange}
                onAmountCommit={(next) => {
                  field.onChange(next)
                  void trigger("installmentAmount")
                }}
                onAmountBlur={field.onBlur}
                amountError={errors.installmentAmount?.message}
                currency={currency || defaultCurrency}
              />
            )}
          />
        </SummarySection>

        <SummarySection title="Calendario" icon={CalendarIcon}>
          <Controller
            control={control}
            name="installmentFreq"
            render={({ field }) => (
              <FinanceSegmentedControl
                label="Frecuencia"
                value={field.value}
                onChange={(value) =>
                  field.onChange(value as FinanceInstallmentFreq)
                }
                options={FREQ_OPTIONS}
              />
            )}
          />
          <Controller
            control={control}
            name="totalInstallments"
            render={({ field }) => (
              <FormTextField
                icon={HashIcon}
                label="Cuotas totales"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.totalInstallments?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="paidInstallments"
            render={({ field }) => (
              <FormTextField
                icon={HashIcon}
                label="Cuotas pagadas"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.paidInstallments?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="nextDueDate"
            render={({ field }) => (
              <FinanceDateField
                label="Próximo vencimiento"
                value={field.value}
                onChange={field.onChange}
                error={errors.nextDueDate?.message}
              />
            )}
          />
        </SummarySection>

        <FinanceDetailsDisclosure>
          <Controller
            control={control}
            name="interestRatePercent"
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <FormTextField
                  icon={PercentIcon}
                  label="Tasa anual (%)"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.interestRatePercent?.message}
                  placeholder="12"
                />
                <FinanceHelpText>Vacío = sin tasa.</FinanceHelpText>
              </div>
            )}
          />
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <FormTextField
                icon={NotebookPenIcon}
                label="Notas"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.notes?.message}
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

      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={institutions}
        value={selectedInstitutionId}
        noneLabel="Prestamista externo"
        onSelect={(next) =>
          setValue("institutionId", next, { shouldValidate: true })
        }
      />

      <DestinationPickerSheet
        open={picker === "account"}
        onOpenChange={closeHandlerFor("account")}
        institutions={pickerInstitutions}
        accounts={institutionAccounts}
        cards={[]}
        display={display}
        accountsOnly
        onSelect={(next) =>
          setValue("accountId", splitLedgerTarget(next).accountId ?? "", {
            shouldValidate: true,
          })
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
            <AlertDialogTitle>¿Borrar este préstamo?</AlertDialogTitle>
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
