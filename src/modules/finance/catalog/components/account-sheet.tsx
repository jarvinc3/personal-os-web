"use client"

import { FinanceCurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/finance-currency-picker-sheet"
import {
  InstitutionPickerSheet,
  InstitutionTrigger,
} from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { AccountProductRow } from "@/src/modules/finance/shared/components/product-rows"
import { useFinanceEnabled } from "@/src/modules/finance/shared/hooks/use-finance-enabled"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { SheetHelpAction } from "@/src/modules/help"
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
import { useDiscardChanges } from "@/src/modules/finance/shared/hooks/use-discard-changes"
import { buildCreateAccountBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import {
  cashAccountNameFor,
  cashCurrencyMissing,
} from "@/src/modules/finance/shared/lib/cash"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCashSummary,
  FinanceInstitution,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"
import { SwitchFieldRow } from "@/src/shared/components/forms/switch-field-row"
import { Button } from "@/src/shared/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"
import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/data-display/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import { HashIcon, LandmarkIcon, Palette, SaveIcon, Star } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  accountSchemaFor,
  type AccountFormValues,
} from "@/src/modules/finance/catalog/lib/account-form"
import { resolveAccountFormReset } from "@/src/modules/finance/catalog/lib/account-form-session"

const TYPE_OPTIONS = FINANCE_ACCOUNT_TYPES.map((value) => ({
  value,
  label: FINANCE_ACCOUNT_TYPE_LABEL[value],
}))

type AccountSheetPrefill = {
  name?: string
  type?: AccountFormValues["type"]
  currency?: string
  lastFour?: string
}

function toFormValues(
  account: FinanceAccount | null,
  defaultCurrency: string,
  defaultInstitutionId: string,
  defaultType: AccountFormValues["type"] = "CHECKING",
  prefill: AccountSheetPrefill = {}
): AccountFormValues {
  const type = account?.type ?? prefill.type ?? defaultType
  return {
    name: account?.name ?? prefill.name ?? "",
    type,
    currency: account?.currency ?? prefill.currency ?? defaultCurrency,
    institutionId:
      account?.institutionId ??
      (type === "CASH" ? CATALOG_NONE : defaultInstitutionId),
    accountNumber: account ? "" : (prefill.lastFour ?? ""),
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
  /** Inside Efectivo the type is fixed to CASH and the bank fields are hidden. */
  lockType?: boolean
  /** Cash summary, so a new currency offers the default "Efectivo <moneda>" name. */
  cash?: FinanceCashSummary
  pending?: boolean
  /** Valores del correo para el alta desde una propuesta. */
  prefill?: AccountSheetPrefill
  /** Basta con los últimos 4 dígitos: no se exige el número completo. */
  lastFourOnly?: boolean
  /** Alta desde una propuesta: entrega la cuenta creada, sin cerrar la hoja. */
  onCreated?: (account: FinanceAccount) => void
  /** Institución elegida fuera de la hoja; se sincroniza sin perder el resto. */
  selectedInstitutionId?: string
  /** Una propuesta nunca crea la cuenta de Efectivo. */
  excludeCash?: boolean
}

export function AccountSheet({
  open,
  onOpenChange,
  account,
  institutions,
  defaultCurrency,
  defaultInstitutionId,
  defaultType = "CHECKING",
  lockType = false,
  cash,
  pending = false,
  prefill = {},
  lastFourOnly = false,
  onCreated,
  selectedInstitutionId,
  excludeCash = false,
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

  const accountResolver = useMemo(
    () => zodResolver(accountSchemaFor({ isEdit })),
    [isEdit]
  )
  const typeOptions = excludeCash
    ? TYPE_OPTIONS.filter((option) => option.value !== "CASH")
    : TYPE_OPTIONS
  const prefillName = prefill.name
  const prefillType = prefill.type
  const prefillCurrency = prefill.currency
  const prefillLastFour = prefill.lastFour
  const initialValues = useMemo(
    () =>
      toFormValues(
        account,
        defaultCurrency,
        resolvedDefaultInstitutionId,
        defaultType,
        {
          name: prefillName,
          type: prefillType,
          currency: prefillCurrency,
          lastFour: prefillLastFour,
        }
      ),
    [
      account,
      defaultCurrency,
      resolvedDefaultInstitutionId,
      defaultType,
      prefillName,
      prefillType,
      prefillCurrency,
      prefillLastFour,
    ]
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    trigger,
    formState: { errors, isDirty },
  } = useForm<AccountFormValues>({
    resolver: accountResolver,
    defaultValues: initialValues,
  })

  const { requestOpenChange, discardChangesDialog } = useDiscardChanges({
    isDirty,
    onOpenChange,
  })
  const accountType = useWatch({ control, name: "type" })
  const accountName = useWatch({ control, name: "name" })
  const accountColor = useWatch({ control, name: "color" })
  const accountCurrency = useWatch({ control, name: "currency" })
  const accountNumber = useWatch({ control, name: "accountNumber" })
  const initialBalance = useWatch({ control, name: "initialBalance" })
  const previewLast4 =
    accountNumber.replace(/\D/g, "").slice(-4) || account?.accountNumberLast4
  const institutionId = useWatch({ control, name: "institutionId" })
  const selectedInstitution =
    institutions.find((item) => item.id === institutionId) ?? null
  const { config, formatLocale } = useFinanceEnabled()
  const display = {
    currency: config.baseCurrency,
    showCents: config.display.showCents,
    compactNumbers: config.display.compactNumbers,
    locale: formatLocale,
  }
  const previewBalance = isEdit
    ? (account?.balance ?? "0")
    : initialBalance.trim() || "0"
  const previewAccount: FinanceAccount = {
    id: account?.id ?? "preview",
    institutionId: selectedInstitution?.id ?? null,
    institutionName: selectedInstitution?.name ?? null,
    institutionLogoUrl: selectedInstitution?.logoUrl ?? null,
    name: accountName.trim() || "Nueva cuenta",
    type: accountType,
    currency: accountCurrency,
    accountNumberLast4: accountType === "CASH" ? null : (previewLast4 ?? null),
    balance: previewBalance,
    earmarkedAmount: "0",
    freeBalance: previewBalance,
    color: accountColor || null,
    isActive: true,
    createdAt: account?.createdAt ?? "",
    updatedAt: account?.updatedAt ?? "",
  }
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "institution" | "currency"
  >("none")

  /**
   * Cash lives in the system Efectivo institution, so switching to it drops any
   * bank the user had picked instead of discarding it silently on submit.
   */
  function changeType(next: AccountFormValues["type"]) {
    setValue("type", next)
    if (next === "CASH") {
      setValue("institutionId", CATALOG_NONE, { shouldValidate: true })
    }
  }

  const accountId = account?.id ?? null
  const appliedFormSession = useRef<string | null>(null)
  // Reinicia solo al abrir la hoja o al cambiar de cuenta: cambiar de
  // institución conserva lo escrito y solo sincroniza `institutionId`.
  useEffect(() => {
    const resetPlan = resolveAccountFormReset({
      session: { open, accountId },
      appliedSession: appliedFormSession.current,
      initialValues,
    })
    appliedFormSession.current = resetPlan.appliedSession
    if (!resetPlan.values) {
      return
    }
    reset(resetPlan.values)
  }, [open, accountId, initialValues, reset])

  const appliedInstitutionId = useRef(selectedInstitutionId)
  useEffect(() => {
    if (
      !open ||
      !selectedInstitutionId ||
      appliedInstitutionId.current === selectedInstitutionId
    ) {
      return
    }
    appliedInstitutionId.current = selectedInstitutionId
    if (selectedInstitutionId !== institutionId) {
      setValue("institutionId", selectedInstitutionId, {
        shouldValidate: true,
      })
    }
  }, [open, selectedInstitutionId, institutionId, setValue])

  useEffect(() => {
    if (!open || !lockType || isEdit || accountType !== "CASH") {
      return
    }
    if (!cashCurrencyMissing(cash, accountCurrency)) {
      return
    }
    const currentName = getValues("name")
    if (currentName && !currentName.startsWith("Efectivo")) {
      return
    }
    setValue("name", cashAccountNameFor(accountCurrency, defaultCurrency), {
      shouldValidate: false,
    })
  }, [
    open,
    lockType,
    isEdit,
    accountType,
    accountCurrency,
    defaultCurrency,
    cash,
    getValues,
    setValue,
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
      { isUpdate: isEdit, lastFourOnly }
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
          try {
            await adjustBalance.mutateAsync({
              accountId: created.id,
              balance: parsedInitialBalance,
            })
          } catch (error) {
            // La cuenta ya existe: en el paso a paso se aprueba ese id y el
            // saldo se corrige después, sin repetir el alta.
            if (onCreated) {
              appToast.error({ text1: financeErrorMessage(error) })
              onCreated(created)
              return
            }
            throw error
          }
        }
        appToast.success({ text1: "Cuenta creada" })
        if (onCreated) {
          onCreated(created)
          return
        }
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
        helpAction={<SheetHelpAction sheetKey={FINANCE_SHEET_KEYS.account} />}
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
          <AccountProductRow account={previewAccount} display={display} />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Field
                data-invalid={errors.name ? true : undefined}
                className="gap-0.5"
              >
                <FieldLabel
                  htmlFor="account-name"
                  className="pl-2 text-sm text-muted-foreground"
                >
                  Nombre
                </FieldLabel>
                <InputGroup className="h-10 overflow-hidden px-1">
                  <InputGroupAddon align="inline-start">
                    <LandmarkIcon className="text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="account-name"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    onBlur={field.onBlur}
                    placeholder="Cuenta nómina"
                    aria-invalid={errors.name ? true : undefined}
                  />
                </InputGroup>
                {errors.name?.message ? (
                  <FieldError>{errors.name.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
          {!lockType ? (
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldLabel>Tipo</FieldLabel>
                  <ToggleGroup
                    value={[field.value]}
                    onValueChange={(next) => {
                      if (next.length > 0) {
                        changeType(next[0])
                      }
                    }}
                    variant="outline"
                    size="sm"
                    aria-label="Tipo"
                  >
                    {typeOptions.map((option) => (
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
                  <Field
                    data-invalid={errors.accountNumber ? true : undefined}
                    className="gap-0.5"
                  >
                    <FieldLabel
                      htmlFor="account-number"
                      className="pl-2 text-sm text-muted-foreground"
                    >
                      Número de cuenta
                    </FieldLabel>
                    <InputGroup className="h-10 overflow-hidden px-1">
                      <InputGroupAddon align="inline-start">
                        <HashIcon className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="account-number"
                        value={field.value}
                        onChange={(event) => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        placeholder={
                          isEdit && account?.accountNumberLast4
                            ? `Deja vacío para conservar •••• ${account.accountNumberLast4}`
                            : "0123456789"
                        }
                        aria-invalid={errors.accountNumber ? true : undefined}
                      />
                    </InputGroup>
                    {lastFourOnly && !isEdit ? (
                      <FieldDescription>
                        Basta con los últimos 4 dígitos; el número completo es
                        opcional.
                      </FieldDescription>
                    ) : null}
                    {errors.accountNumber?.message ? (
                      <FieldError>{errors.accountNumber.message}</FieldError>
                    ) : null}
                  </Field>
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
                  calculatorKey="account-opening-balance"
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

      {discardChangesDialog}

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
