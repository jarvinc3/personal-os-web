"use client"

import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import {
  useDisconnectEmailSource,
  useTriggerEmailSync,
  useUpdateEmailSource,
} from "@/src/modules/finance/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import { syncFailureReason } from "@/src/modules/finance/lib/gmail-oauth"
import {
  buildLedgerTargetOptions,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceEmailSource,
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
import { MailIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  target: z.string().min(1, "Elige una cuenta o una tarjeta"),
  bankDomain: z.string().trim().min(1, "Dominio obligatorio").max(150),
  label: z.string().max(120),
})

type FormValues = z.infer<typeof schema>

function toFormValues(source: FinanceEmailSource | null): FormValues {
  const target = source?.accountId
    ? encodeLedgerTarget("account", source.accountId)
    : source?.cardId
      ? encodeLedgerTarget("card", source.cardId)
      : CATALOG_NONE
  return {
    target,
    bankDomain: source?.bankDomain ?? "",
    label: source?.label ?? "",
  }
}

type EmailSourceSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: FinanceEmailSource | null
  accounts: FinanceAccount[]
  cards: FinanceCard[]
}

export function EmailSourceSheet({
  open,
  onOpenChange,
  source,
  accounts,
  cards,
}: EmailSourceSheetProps) {
  const updateMutation = useUpdateEmailSource()
  const disconnectMutation = useDisconnectEmailSource()
  const syncMutation = useTriggerEmailSync()
  const isPending =
    updateMutation.isPending ||
    disconnectMutation.isPending ||
    syncMutation.isPending
  const targetOptions = useMemo(
    () => buildLedgerTargetOptions(accounts, cards),
    [accounts, cards],
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(source),
  })

  useEffect(() => {
    if (open) reset(toFormValues(source))
  }, [open, source, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    if (!source) return
    const target = splitLedgerTarget(values.target)
    if (target.accountId && target.cardId) {
      appToast.error({ text1: "Elige una cuenta o una tarjeta, no ambas" })
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: source.id,
        body: {
          ...target,
          bankDomain: values.bankDomain,
          label: values.label || undefined,
        },
      })
      appToast.success({ text1: "Fuente actualizada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onSync() {
    if (!source) return
    try {
      const result = await syncMutation.mutateAsync(source.id)
      const reason = syncFailureReason(result)
      if (reason) {
        appToast.error({ text1: "Sync no encolado", text2: reason })
        return
      }
      appToast.success({ text1: "Sync encolado" })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  async function onDisconnect() {
    if (!source) return
    const confirmed = window.confirm("¿Desconectar esta cuenta de Gmail?")
    if (!confirmed) return
    try {
      await disconnectMutation.mutateAsync(source.id)
      appToast.success({ text1: "Fuente desconectada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Fuente de Gmail"
      description={source?.emailAddress ?? "Edita dominio y destino."}
      actions={{
        delete: source ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onDisconnect()}
          >
            Desconectar
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
            disabled={isPending || !source}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Destino" icon={MailIcon}>
        {source ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => void onSync()}
          >
            Sincronizar ahora
          </Button>
        ) : null}
        <Controller
          control={control}
          name="target"
          render={({ field }) => (
            <SelectField
              label="Cuenta o tarjeta"
              value={field.value}
              onChange={field.onChange}
              options={targetOptions}
            />
          )}
        />
        {errors.target?.message ? (
          <p className="text-sm text-destructive">{errors.target.message}</p>
        ) : null}
        <Controller
          control={control}
          name="bankDomain"
          render={({ field }) => (
            <FormTextField
              label="Dominio del banco"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.bankDomain?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="label"
          render={({ field }) => (
            <FormTextField
              label="Etiqueta"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
