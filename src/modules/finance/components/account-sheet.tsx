"use client"

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
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  type: z.enum(FINANCE_ACCOUNT_TYPES),
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  institutionId: z.string(),
  color: z.string().trim().max(20),
})

type FormValues = z.infer<typeof schema>

const TYPE_OPTIONS = FINANCE_ACCOUNT_TYPES.map((value) => ({
  value,
  label: FINANCE_ACCOUNT_TYPE_LABEL[value],
}))

function toFormValues(
  account: FinanceAccount | null,
  defaultCurrency: string,
): FormValues {
  return {
    name: account?.name ?? "",
    type: account?.type ?? "CHECKING",
    currency: account?.currency ?? defaultCurrency,
    institutionId: account?.institutionId ?? CATALOG_NONE,
    color: account?.color ?? "",
  }
}

type AccountSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: FinanceAccount | null
  institutions: FinanceInstitution[]
  defaultCurrency: string
}

export function AccountSheet({
  open,
  onOpenChange,
  account,
  institutions,
  defaultCurrency,
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
    [institutions],
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(account, defaultCurrency),
  })

  useEffect(() => {
    if (open) {
      reset(toFormValues(account, defaultCurrency))
    }
  }, [open, account, defaultCurrency, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
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
          text2: `El saldo arranca en ${created.balance}.`,
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
      title={isEdit ? "Editar cuenta" : "Nueva cuenta"}
      description="El saldo empieza en 0. Se actualiza con los movimientos, no en este formulario."
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
          <Button disabled={isPending} className="flex-1" onClick={onSubmit}>
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
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
        name="currency"
        render={({ field }) => (
          <FormTextField
            label="Moneda"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.currency?.message}
            placeholder="DOP"
          />
        )}
      />
      <Controller
        control={control}
        name="institutionId"
        render={({ field }) => (
          <SelectField
            label="Institución"
            value={field.value}
            onChange={field.onChange}
            options={institutionOptions}
          />
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <FormTextField
            label="Color (opcional)"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={errors.color?.message}
            placeholder="#22c55e"
          />
        )}
      />
    </BottomSheet>
  )
}
