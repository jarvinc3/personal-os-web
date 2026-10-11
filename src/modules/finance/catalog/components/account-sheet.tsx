"use client"

import { institutionSelectOptions } from "@/src/modules/finance/shared/components/ledger-target-select"
import { FinanceCurrencyPills } from "@/src/modules/finance/shared/components/forms/currency-pills"
import {
  FinancePreviewRow,
  FinanceSegmentedControl,
} from "@/src/modules/finance/shared/components/forms/form-blocks"
import {
  CATALOG_NONE,
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_ACCOUNT_TYPES,
} from "@/src/modules/finance/shared/constants/catalog"
import {
  useArchiveAccount,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/src/modules/finance/shared/hooks/use-accounts"
import { buildCreateAccountBody } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceInstitution,
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
import {
  FormTextField,
  SelectField,
  SwitchFieldRow,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { ColorPickerSwatch } from "@/src/shared/components/ui/color-picker"
import { Label } from "@/src/shared/components/ui/label"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { getModule } from "@/src/shared/constants/module-registry"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArchiveIcon,
  HashIcon,
  LandmarkIcon,
  Palette,
  SaveIcon,
  Star,
  TrashIcon,
  WalletIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
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
    isDefaultForInstitution: account?.isDefaultForInstitution ?? false,
  }
}

type AccountSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: FinanceAccount | null
  institutions: FinanceInstitution[]
  defaultCurrency: string
  display?: FinanceMoneyDisplay
  defaultInstitutionId?: string
  defaultType?: AccountFormValues["type"]
  pending?: boolean
  onDeleted?: () => void
}

export function AccountSheet({
  open,
  onOpenChange,
  account,
  institutions,
  defaultCurrency,
  display,
  defaultInstitutionId,
  defaultType = "CHECKING",
  pending = false,
  onDeleted,
}: AccountSheetProps) {
  const isEdit = Boolean(account)
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const archiveMutation = useArchiveAccount()
  const deleteMutation = useDeleteAccount()
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending

  const institutionOptions = useMemo(
    () =>
      institutionSelectOptions(institutions, {
        value: CATALOG_NONE,
        label: "Sin institución",
      }),
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
    const payload = buildCreateAccountBody(
      {
        ...values,
        accountNumber: values.type === "CASH" ? "" : values.accountNumber,
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
        appToast.success({
          text1: "Cuenta creada",
          text2: `El saldo arranca en ${formatFinanceMoney(created.balance, {
            currency: created.currency,
            showCents: display?.showCents ?? true,
            compactNumbers: display?.compactNumbers ?? false,
          })}.`,
        })
      }
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onArchive() {
    if (!account) {
      return
    }
    try {
      await archiveMutation.mutateAsync(account.id)
      appToast.success({ text1: "Cuenta archivada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onDelete() {
    if (!account) {
      return
    }
    try {
      await deleteMutation.mutateAsync(account.id)
      appToast.success({ text1: "Cuenta borrada" })
      setConfirmOpen(false)
      onOpenChange(false)
      onDeleted?.()
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
        title={isEdit ? "Editar cuenta" : "Nueva cuenta"}
        description={
          hasInstitutions
            ? "El saldo empieza en 0. Se actualiza con los movimientos, no en este formulario."
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
          <Controller
            control={control}
            name="institutionId"
            render={({ field }) => (
              <SelectField
                icon={WalletIcon}
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
          {accountType !== "CASH" ? (
            <>
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
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <FinanceCurrencyPills
                value={field.value}
                onChange={field.onChange}
                baseCurrency={defaultCurrency}
                extraCodes={[defaultCurrency, account?.currency ?? ""]}
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

        {isEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-destructive"
              disabled={isPending}
              onClick={() => void onArchive()}
            >
              <ArchiveIcon className="size-4" />
              Archivar
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              className="flex-1"
              onClick={() => setConfirmOpen(true)}
            >
              <TrashIcon className="size-4" />
              Borrar
            </Button>
          </div>
        )}
      </BottomSheet>

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
            <AlertDialogTitle>¿Borrar esta cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminan sus movimientos, tarjetas débito y saldos. No se puede
              deshacer.
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
