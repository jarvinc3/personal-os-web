"use client"

import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  InstitutionPickerSheet,
  InstitutionTrigger,
} from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import {
  FinancePreviewRow,
  FinanceSegmentedControl,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import {
  CATALOG_NONE,
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_ACCOUNT_TYPES,
} from "@/src/modules/finance/shared/constants/catalog"
import { useAdjustBalance } from "@/src/modules/finance/shared/hooks/use-balance-adjustment"
import {
  useCreateAccount,
  useUpdateAccount,
} from "@/src/modules/finance/shared/hooks/use-accounts"
import { buildCreateAccountBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  HashIcon,
  LandmarkIcon,
  Palette,
  SaveIcon,
  Star,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  accountSchema,
  type AccountFormValues,
} from "@/src/modules/finance/catalog/lib/account-form"

const TYPE_OPTIONS = FINANCE_ACCOUNT_TYPES.map((value) => ({
  value,
  label: FINANCE_ACCOUNT_TYPE_LABEL[value],
}))

function toFormValues(
  account: FinanceAccount | null,
  defaultCurrency: string,
  defaultInstitutionId: string,
  defaultType: AccountFormValues["type"] = "CHECKING"
): AccountFormValues {
  const type = account?.type ?? defaultType
  return {
    name: account?.name ?? "",
    type,
    currency: account?.currency ?? defaultCurrency,
    institutionId:
      account?.institutionId ??
      (type === "CASH" ? CATALOG_NONE : defaultInstitutionId),
    accountNumber: account?.accountNumber ?? "",
    color: account?.color ?? "",
    initialBalance: "",
    isDefaultForInstitution: account?.isDefaultForInstitution ?? false,
  }
}

type AccountSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: FinanceAccount | null
  institutions: FinanceInstitution[]
  defaultCurrency: string
  defaultInstitutionId?: string
  defaultType?: AccountFormValues["type"]
  pending?: boolean
}

export function AccountSheet({
  open,
  onOpenChange,
  account,
  institutions,
  defaultCurrency,
  defaultInstitutionId,
  defaultType = "CHECKING",
  pending = false,
}: AccountSheetProps) {
  const isEdit = Boolean(account)
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const adjustBalance = useAdjustBalance()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    adjustBalance.isPending

  const hasInstitutions = institutions.length > 0
  const resolvedDefaultInstitutionId =
    defaultInstitutionId ?? institutions[0]?.id ?? CATALOG_NONE

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: toFormValues(
      account,
      defaultCurrency,
      resolvedDefaultInstitutionId,
      defaultType
    ),
  })

  const accountType = useWatch({ control, name: "type" })
  const accountName = useWatch({ control, name: "name" })
  const accountColor = useWatch({ control, name: "color" })
  const accountCurrency = useWatch({ control, name: "currency" })
  const accountNumber = useWatch({ control, name: "accountNumber" })
  const institutionId = useWatch({ control, name: "institutionId" })
  const selectedInstitution =
    institutions.find((item) => item.id === institutionId) ?? null
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "institution" | "currency"
  >("none")

  useEffect(() => {
    if (open) {
      reset(
        toFormValues(
          account,
          defaultCurrency,
          resolvedDefaultInstitutionId,
          defaultType
        )
      )
    }
  }, [
    open,
    account,
    defaultCurrency,
    resolvedDefaultInstitutionId,
    defaultType,
    reset,
  ])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    const { initialBalance, ...accountValues } = values
    const payload = buildCreateAccountBody(
      {
        ...accountValues,
        accountNumber:
          accountValues.type === "CASH" ? "" : accountValues.accountNumber,
      },
      { isUpdate: isEdit }
    )
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
        const parsedInitialBalance = parseFinanceMoney(initialBalance)
        if (parsedInitialBalance !== null && parsedInitialBalance > 0) {
          await adjustBalance.mutateAsync({
            accountId: created.id,
            balance: parsedInitialBalance,
          })
        }
        appToast.success({ text1: "Cuenta creada" })
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
        onOpenChange={onOpenChange}
        pending={pending}
        title={isEdit ? "Editar cuenta" : "Nueva cuenta"}
        description={
          isEdit
            ? "El saldo se actualiza con los movimientos. Usa Ajustar saldo para cambiarlo."
            : hasInstitutions
              ? "El saldo inicial es opcional y se puede cambiar después con Ajustar saldo."
              : "Crea una institución bancaria antes de agregar una cuenta."
        }
        actions={{
          close: (
            <Button
              key="cancel"
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
              key="submit"
              disabled={isPending || (!isEdit && !hasInstitutions)}
              className="flex-1"
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
        <SummarySection title="Cuenta" icon={LandmarkIcon}>
          <FinancePreviewRow
            icon={LandmarkIcon}
            title={accountName.trim() || "Nueva cuenta"}
            description={
              accountType !== "CASH" &&
              accountNumber.replace(/\D/g, "").length >= 4
                ? `${FINANCE_ACCOUNT_TYPE_LABEL[accountType]} · •••• ${accountNumber.replace(/\D/g, "").slice(-4)}`
                : `${FINANCE_ACCOUNT_TYPE_LABEL[accountType]} · ${accountCurrency}`
            }
            accentColor={accountColor || undefined}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <FormTextField
                icon={LandmarkIcon}
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
              <FinanceSegmentedControl
                label="Tipo"
                value={field.value}
                onChange={field.onChange}
                options={TYPE_OPTIONS}
              />
            )}
          />
          {accountType !== "CASH" ? (
            <>
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Institución
                </FieldLabel>
                <InstitutionTrigger
                  institution={selectedInstitution}
                  placeholder={
                    hasInstitutions
                      ? "Elige la institución"
                      : "Crea una institución primero"
                  }
                  disabled={!hasInstitutions}
                  onClick={() => openPicker("institution")}
                />
                {errors.institutionId?.message ? (
                  <FieldError>{errors.institutionId.message}</FieldError>
                ) : null}
              </Field>
              <Controller
                control={control}
                name="accountNumber"
                render={({ field }) => (
                  <FormTextField
                    icon={HashIcon}
                    label="Número de cuenta"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.accountNumber?.message}
                    placeholder="0123456789"
                  />
                )}
              />
              <Controller
                control={control}
                name="isDefaultForInstitution"
                render={({ field }) => (
                  <SwitchFieldRow
                    icon={Star}
                    iconColor={getModule("finance").accent}
                    label="Cuenta predeterminada"
                    description="Se usa cuando el correo del banco no trae dígitos de cuenta."
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </>
          ) : null}
          {!isEdit ? (
            <Controller
              control={control}
              name="initialBalance"
              render={({ field }) => (
                <FinanceMoneyField
                  label="Saldo inicial"
                  amount={field.value}
                  onAmountChange={field.onChange}
                  onAmountCommit={(next) => {
                    field.onChange(next)
                    void trigger("initialBalance")
                  }}
                  onAmountBlur={field.onBlur}
                  amountError={errors.initialBalance?.message}
                  currency={accountCurrency || defaultCurrency}
                  onCurrencyPress={() => openPicker("currency")}
                />
              )}
            />
          ) : null}
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

      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={institutions}
        value={institutionId}
        onSelect={(next) =>
          setValue("institutionId", next, { shouldValidate: true })
        }
      />

      <FinanceCurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={closeHandlerFor("currency")}
        value={accountCurrency || defaultCurrency}
        onSelect={(next) =>
          setValue("currency", next, { shouldValidate: true })
        }
      />
    </>
  )
}
