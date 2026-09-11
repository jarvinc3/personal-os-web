"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import {
  CATALOG_NONE,
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_ACCOUNT_TYPES,
} from "@/src/modules/finance/constants/catalog"
import {
  useArchiveAccount,
  useCreateAccount,
  useUpdateAccount,
} from "@/src/modules/finance/hooks/use-accounts"
import { buildCreateAccountBody } from "@/src/modules/finance/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign, LandmarkIcon, Palette } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const schema = z
  .object({
    name: z.string().trim().min(1, "Nombre obligatorio").max(120),
    type: z.enum(FINANCE_ACCOUNT_TYPES),
    currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
    institutionId: z.string(),
    color: z.string().trim().max(20),
  })
  .superRefine((values, ctx) => {
    if (
      values.type !== "CASH" &&
      (!values.institutionId || values.institutionId === CATALOG_NONE)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["institutionId"],
        message: "La cuenta necesita una institución",
      })
    }
  })

type FormValues = z.infer<typeof schema>

const TYPE_OPTIONS = FINANCE_ACCOUNT_TYPES.map((value) => ({
  value,
  label: FINANCE_ACCOUNT_TYPE_LABEL[value],
}))

function toFormValues(
  account: FinanceAccount | null,
  defaultCurrency: string,
  defaultInstitutionId: string
): FormValues {
  return {
    name: account?.name ?? "",
    type: account?.type ?? "CHECKING",
    currency: account?.currency ?? defaultCurrency,
    institutionId:
      account?.institutionId ??
      (account?.type === "CASH" ? CATALOG_NONE : defaultInstitutionId),
    color: account?.color ?? "",
  }
}

type AccountSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: FinanceAccount | null
  institutions: FinanceInstitution[]
  defaultCurrency: string
  display: FinanceMoneyDisplay
  defaultInstitutionId?: string
  pending?: boolean
}

export function AccountSheet({
  open,
  onOpenChange,
  account,
  institutions,
  defaultCurrency,
  display,
  defaultInstitutionId,
  pending = false,
}: AccountSheetProps) {
  const isEdit = Boolean(account)
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const archiveMutation = useArchiveAccount()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending

  const institutionOptions = useMemo(
    () => [
      { value: CATALOG_NONE, label: "Sin institución" },
      ...institutions.map((item) => ({ value: item.id, label: item.name })),
    ],
    [institutions]
  )
  const hasInstitutions = institutions.length > 0
  const resolvedDefaultInstitutionId =
    defaultInstitutionId ?? institutions[0]?.id ?? CATALOG_NONE

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(
      account,
      defaultCurrency,
      resolvedDefaultInstitutionId
    ),
  })

  const accountType = useWatch({ control, name: "type" })

  useEffect(() => {
    if (open) {
      reset(
        toFormValues(account, defaultCurrency, resolvedDefaultInstitutionId)
      )
    }
  }, [open, account, defaultCurrency, resolvedDefaultInstitutionId, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const payload = buildCreateAccountBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      if (account) {
        await updateMutation.mutateAsync({
          id: account.id,
          body: payload.body,
        })
        appToast.success({ text1: "Cuenta actualizada" })
      } else {
        const created = await createMutation.mutateAsync(payload.body)
        appToast.success({
          text1: "Cuenta creada",
          text2: `El saldo arranca en ${formatFinanceMoney(created.balance, {
            ...display,
            currency: created.currency,
          })}.`,
        })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onArchive() {
    if (!account) return
    try {
      await archiveMutation.mutateAsync(account.id)
      appToast.success({ text1: "Cuenta archivada" })
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
      title={isEdit ? "Editar cuenta" : "Nueva cuenta"}
      description={
        hasInstitutions
          ? "El saldo empieza en 0. Se actualiza con los movimientos, no en este formulario."
          : "Crea una institución bancaria antes de agregar una cuenta."
      }
      actions={{
        delete: isEdit ? (
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => void onArchive()}
          >
            Archivar
          </Button>
        ) : undefined,
        close: (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        ),
        submit: (
          <Button
            disabled={isPending || (!isEdit && !hasInstitutions)}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Cuenta" icon={LandmarkIcon}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormTextField
              label="Nombre"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.name?.message}
              placeholder="Cuenta nómina"
            />
          )}
        />
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SelectField
              label="Tipo"
              value={field.value}
              onChange={field.onChange}
              options={TYPE_OPTIONS}
            />
          )}
        />
        <Controller
          control={control}
          name="institutionId"
          render={({ field }) => (
            <SelectField
              label={
                accountType === "CASH"
                  ? "Institución (opcional)"
                  : "Institución"
              }
              value={field.value}
              onChange={field.onChange}
              options={
                hasInstitutions || accountType === "CASH"
                  ? institutionOptions
                  : [
                      {
                        value: CATALOG_NONE,
                        label: "Crea una institución primero",
                      },
                    ]
              }
              disabled={!hasInstitutions && accountType !== "CASH"}
            />
          )}
        />
        {errors.institutionId?.message ? (
          <p className="text-sm text-destructive">
            {errors.institutionId.message}
          </p>
        ) : null}
      </SummarySection>
      <SummarySection title="Moneda" icon={DollarSign}>
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
      <SummarySection title="Apariencia" icon={Palette}>
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-color">Color</Label>
              <ColorPickerSwatch
                id="account-color"
                variant="button"
                value={field.value}
                onChange={field.onChange}
              />
            </div>
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
