"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import {
  useArchiveLoan,
  useCreateLoan,
  useUpdateLoan,
} from "@/src/modules/finance/hooks/use-loans"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { rateFractionToPercent } from "@/src/modules/finance/lib/interest-rate"
import { formatPlanningDate } from "@/src/modules/finance/lib/planning-lists"
import { buildLoanBody } from "@/src/modules/finance/lib/planning-payloads"
import type {
  FinanceAccount,
  FinanceInstallmentFreq,
  FinanceInstitution,
  FinanceLoan,
} from "@/src/modules/finance/types/entities"
import {
  FINANCE_INSTALLMENT_FREQ_LABEL,
  FINANCE_INSTALLMENT_FREQS,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LandmarkIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  lenderName: z.string().trim().min(1, "Prestamista obligatorio").max(120),
  institutionId: z.string(),
  accountId: z.string(),
  originalAmount: z.string().trim().min(1, "Monto original obligatorio"),
  currentBalance: z.string().trim().min(1, "Saldo obligatorio"),
  installmentAmount: z.string().trim().min(1, "Cuota obligatoria"),
  installmentFreq: z.enum(FINANCE_INSTALLMENT_FREQS),
  totalInstallments: z.string().trim().min(1, "Cuotas totales obligatorias"),
  paidInstallments: z.string(),
  nextDueDate: z.string().trim().min(1, "Próximo vencimiento obligatorio"),
  interestRatePercent: z.string(),
  notes: z.string().max(500),
  currency: z.string().trim().min(3).max(3),
})

type FormValues = z.infer<typeof schema>

const FREQ_OPTIONS = FINANCE_INSTALLMENT_FREQS.map((value) => ({
  value,
  label: FINANCE_INSTALLMENT_FREQ_LABEL[value],
}))

function todayInput(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function toFormValues(
  loan: FinanceLoan | null,
  defaultCurrency: string,
): FormValues {
  return {
    lenderName: loan?.lenderName ?? "",
    institutionId: loan?.institutionId ?? CATALOG_NONE,
    accountId: loan?.accountId ?? CATALOG_NONE,
    originalAmount: loan?.originalAmount ?? "",
    currentBalance: loan?.currentBalance ?? "",
    installmentAmount: loan?.installmentAmount ?? "",
    installmentFreq: loan?.installmentFreq ?? "MONTHLY",
    totalInstallments: loan ? String(loan.totalInstallments) : "",
    paidInstallments: loan ? String(loan.paidInstallments) : "0",
    nextDueDate: formatPlanningDate(loan?.nextDueDate) || todayInput(),
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
}

export function LoanSheet({
  open,
  onOpenChange,
  loan,
  accounts,
  institutions,
  defaultCurrency,
}: LoanSheetProps) {
  const isEdit = Boolean(loan)
  const createMutation = useCreateLoan()
  const updateMutation = useUpdateLoan()
  const archiveMutation = useArchiveLoan()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(loan, defaultCurrency),
  })

  const selectedInstitutionId = useWatch({ control, name: "institutionId" })
  const selectedAccountId = useWatch({ control, name: "accountId" })

  const institutionOptions = useMemo(
    () => [
      { value: CATALOG_NONE, label: "Prestamista externo" },
      ...institutions.map((item) => ({ value: item.id, label: item.name })),
    ],
    [institutions],
  )

  const institutionAccounts = accounts.filter(
    (item) =>
      item.isActive &&
      (selectedInstitutionId === CATALOG_NONE ||
        item.institutionId === selectedInstitutionId),
  )
  const accountOptions = useMemo(
    () => [
      { value: CATALOG_NONE, label: "Sin cuenta de pago" },
      ...institutionAccounts.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    ],
    [institutionAccounts],
  )

  useEffect(() => {
    if (open) {
      reset(toFormValues(loan, defaultCurrency))
    }
  }, [open, loan, defaultCurrency, reset])

  useEffect(() => {
    if (
      selectedAccountId !== CATALOG_NONE &&
      !accounts.some(
        (item) =>
          item.id === selectedAccountId &&
          item.isActive &&
          (selectedInstitutionId === CATALOG_NONE ||
            item.institutionId === selectedInstitutionId),
      )
    ) {
      setValue("accountId", CATALOG_NONE)
    }
  }, [accounts, selectedAccountId, selectedInstitutionId, setValue])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildLoanBody(
      {
        ...values,
        interestRatePercent: values.interestRatePercent,
      },
      { isUpdate: isEdit },
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
    if (!loan) return
    try {
      await archiveMutation.mutateAsync(loan.id)
      appToast.success({ text1: "Préstamo archivado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Editar préstamo" : "Nuevo préstamo"}
      description="12% se envía como 0.12. La tasa no es un entero de porcentaje."
      actions={{
        delete: isEdit ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onArchive()}
          >
            Archivar
          </Button>
        ) : undefined,
        close: (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
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
              label="Prestamista"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.lenderName?.message}
              placeholder="Banco Popular"
            />
          )}
        />
        <Controller
          control={control}
          name="institutionId"
          render={({ field }) => (
            <SelectField
              label="Institución (si está en el catálogo)"
              value={field.value}
              onChange={field.onChange}
              options={institutionOptions}
            />
          )}
        />
        <Controller
          control={control}
          name="accountId"
          render={({ field }) => (
            <SelectField
              label="Cuenta de pago (opcional)"
              value={field.value}
              onChange={field.onChange}
              options={accountOptions}
            />
          )}
        />
        <Controller
          control={control}
          name="originalAmount"
          render={({ field }) => (
            <FormTextField
              label="Monto original"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.originalAmount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="currentBalance"
          render={({ field }) => (
            <FormTextField
              label="Saldo actual"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.currentBalance?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="installmentAmount"
          render={({ field }) => (
            <FormTextField
              label="Cuota"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.installmentAmount?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="installmentFreq"
          render={({ field }) => (
            <SelectField
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
            <FormTextField
              label="Próximo vencimiento"
              type="date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.nextDueDate?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="interestRatePercent"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <FormTextField
                label="Tasa anual (%)"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.interestRatePercent?.message}
                placeholder="12"
              />
              <p className="text-xs text-muted-foreground">
                12% se envía como 0.12. Vacío = sin tasa (no es lo mismo que 0%).
              </p>
            </div>
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <FormTextField
              label="Notas"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.notes?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <CurrencySelectField
              value={field.value}
              onChange={field.onChange}
              enabled={open}
              extraCodes={[defaultCurrency]}
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
