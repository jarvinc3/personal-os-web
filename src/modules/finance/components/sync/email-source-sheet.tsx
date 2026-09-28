"use client"

import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { EmailSyncLogList } from "@/src/modules/finance/components/sync/email-sync-history"
import {
  useDisconnectEmailSource,
  useRunEmailSync,
  useUpdateEmailSource,
} from "@/src/modules/finance/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type {
  FinanceEmailSource,
  FinanceInstitution,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { HistoryIcon, MailIcon, RefreshCwIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  institutionId: z.string().min(1, "Elige una institución"),
  bankSenderEmail: z
    .string()
    .trim()
    .email("Correo de notificaciones inválido")
    .max(150),
  label: z.string().max(120),
})

type FormValues = z.infer<typeof schema>

function toFormValues(source: FinanceEmailSource | null): FormValues {
  return {
    institutionId: source?.institutionId ?? CATALOG_NONE,
    bankSenderEmail: source?.bankSenderEmail ?? "",
    label: source?.label ?? "",
  }
}

type EmailSourceSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  source: FinanceEmailSource | null
  institutions: FinanceInstitution[]
  emailSyncEnabled: boolean
  pending?: boolean
}

export function EmailSourceSheet({
  open,
  onOpenChange,
  source,
  institutions,
  emailSyncEnabled,
  pending = false,
}: EmailSourceSheetProps) {
  const updateMutation = useUpdateEmailSource()
  const disconnectMutation = useDisconnectEmailSource()
  const { run: runSync, isPending: syncPending } =
    useRunEmailSync(emailSyncEnabled)
  const isPending =
    updateMutation.isPending ||
    disconnectMutation.isPending ||
    syncPending
  const institutionOptions = institutions
    .filter((item) => item.isActive)
    .map((item) => ({ value: item.id, label: item.name }))

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
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!source) return
    try {
      await updateMutation.mutateAsync({
        id: source.id,
        body: {
          institutionId: values.institutionId,
          bankSenderEmail: values.bankSenderEmail,
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
    await runSync(source.id)
  }

  async function onDisconnect() {
    if (!source) return
    const confirmed = window.confirm("¿Desvincular esta institución de Gmail?")
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
      pending={pending}
      title="Editar vínculo"
      description={
        source?.emailAddress ?? "Edita el remitente y la institución."
      }
      actions={{
        delete: source ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void onDisconnect()}
          >
            Desvincular
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
      <SummarySection title="Sincronización" icon={RefreshCwIcon}>
        {source ? (
          <div className="flex flex-col gap-2 px-3 pb-3">
            <Button
              type="button"
              className="w-full"
              disabled={isPending || !source.isActive || !emailSyncEnabled}
              onClick={() => void onSync()}
            >
              {syncPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon data-icon="inline-start" />
              )}
              Sincronizar ahora
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isPending || !source.isActive || !emailSyncEnabled}
              onClick={() => void runSync(source.id, { forceFullSync: true })}
            >
              Releer todo
            </Button>
          </div>
        ) : null}
      </SummarySection>
      <SummarySection title="Últimos syncs" icon={HistoryIcon}>
        <EmailSyncLogList
          logs={(source?.logs ?? []).map((log) => ({
            ...log,
            sourceName: source?.label || source?.institutionName || "Banco",
          }))}
          emptyLabel="Este vínculo aún no tiene runs. El primer sync aparecerá aquí."
        />
      </SummarySection>
      <SummarySection title="Institución" icon={MailIcon}>
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
        {errors.institutionId?.message ? (
          <p className="text-sm text-destructive">
            {errors.institutionId.message}
          </p>
        ) : null}
        <Controller
          control={control}
          name="bankSenderEmail"
          render={({ field }) => (
            <FormTextField
              label="Correo del banco"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="alertas@bhd.com.do"
              error={errors.bankSenderEmail?.message}
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
