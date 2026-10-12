"use client"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  useAddSourceSenders,
  useDisconnectEmailSource,
  useDiscoveredSenders,
  useRunEmailSync,
  useUpdateEmailSource,
} from "@/src/modules/finance/shared/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type {
  FinanceEmailSource,
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
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import {
  InstitutionPickerSheet,
  InstitutionTrigger,
} from "@/src/modules/finance/shared/components/pickers/institution-picker"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  MailIcon,
  PlusIcon,
  RefreshCwIcon,
  TagIcon,
  UnlinkIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import {
  emailSourceSchema,
  type EmailSourceFormValues,
} from "@/src/modules/finance/sync/lib/email-source-form"

function extraSendersFromSource(source: FinanceEmailSource | null): string {
  const extras = (source?.bankSenderEmails ?? []).filter(
    (email) => email && email !== source?.bankSenderEmail
  )
  return extras.join(", ")
}

function toFormValues(
  source: FinanceEmailSource | null
): EmailSourceFormValues {
  return {
    institutionId: source?.institutionId ?? CATALOG_NONE,
    bankSenderEmail: source?.bankSenderEmail ?? "",
    extraSenders: extraSendersFromSource(source),
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
  const addSendersMutation = useAddSourceSenders()
  const discoveredQuery = useDiscoveredSenders(
    open ? (source?.id ?? null) : null,
    Boolean(open && source)
  )
  const { run: runSync, isPending: syncPending } =
    useRunEmailSync(emailSyncEnabled)
  const isPending =
    updateMutation.isPending || disconnectMutation.isPending || syncPending
  const activeInstitutions = institutions.filter((item) => item.isActive)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmailSourceFormValues>({
    resolver: zodResolver(emailSourceSchema),
    defaultValues: toFormValues(source),
  })

  const institutionId = useWatch({ control, name: "institutionId" })
  const selectedInstitution =
    institutions.find((item) => item.id === institutionId) ?? null
  const { picker, openPicker, closeHandlerFor } = usePicker<
    "none" | "institution"
  >("none")

  useEffect(() => {
    if (open) {
      reset(toFormValues(source))
    }
  }, [open, source, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!source) {
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: source.id,
        body: {
          institutionId: values.institutionId,
          bankSenderEmail: values.bankSenderEmail,
          bankSenderEmails: [
            values.bankSenderEmail,
            ...values.extraSenders
              .split(/[,\s]+/)
              .map((item) => item.trim().toLowerCase())
              .filter(Boolean),
          ],
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
    if (!source) {
      return
    }
    await runSync(source.id)
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  async function onDisconnect() {
    if (!source) {
      return
    }
    try {
      await disconnectMutation.mutateAsync(source.id)
      appToast.success({ text1: "Fuente desconectada" })
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
              onClick={() => setConfirmOpen(true)}
            >
              <UnlinkIcon className="size-4 shrink-0" />
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
              <XIcon className="size-4 shrink-0" />
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
                <RefreshCwIcon className="size-4 shrink-0" />
                Releer todo
              </Button>
            </div>
          ) : null}
        </SummarySection>
        <SummarySection title="Institución" icon={MailIcon}>
          <Field className="gap-1">
            <FieldLabel className="text-sm text-muted-foreground">
              Institución
            </FieldLabel>
            <InstitutionTrigger
              institution={selectedInstitution}
              onClick={() => openPicker("institution")}
            />
            {errors.institutionId?.message ? (
              <FieldError>{errors.institutionId.message}</FieldError>
            ) : null}
          </Field>
          <Controller
            control={control}
            name="bankSenderEmail"
            render={({ field }) => (
              <FormTextField
                icon={MailIcon}
                label="Correo del banco"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="ej. alertas@banco.com"
                error={errors.bankSenderEmail?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="extraSenders"
            render={({ field }) => (
              <FormTextField
                icon={MailIcon}
                label="Otros remitentes"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="avisos@banco.com, notificaciones@banco.com"
                error={errors.extraSenders?.message}
              />
            )}
          />
          {discoveredQuery.data && discoveredQuery.data.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Otros From de este dominio (elige cuáles son de movimientos)
              </p>
              {discoveredQuery.data.map((item) => (
                <Button
                  key={item.email}
                  type="button"
                  variant="secondary"
                  disabled={addSendersMutation.isPending || !source}
                  onClick={() => {
                    if (!source) {
                      return
                    }
                    void addSendersMutation
                      .mutateAsync({ id: source.id, emails: [item.email] })
                      .then(() =>
                        appToast.success({ text1: `Añadido ${item.email}` })
                      )
                      .catch((error) =>
                        appToast.error({ text1: financeErrorMessage(error) })
                      )
                  }}
                >
                  <PlusIcon className="size-4 shrink-0" />
                  Añadir {item.email} ({item.count})
                </Button>
              ))}
            </div>
          ) : null}
          <Controller
            control={control}
            name="label"
            render={({ field }) => (
              <FormTextField
                icon={TagIcon}
                label="Etiqueta"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </SummarySection>
      </BottomSheet>

      <InstitutionPickerSheet
        open={picker === "institution"}
        onOpenChange={closeHandlerFor("institution")}
        institutions={activeInstitutions}
        value={institutionId}
        onSelect={(next) =>
          setValue("institutionId", next, { shouldValidate: true })
        }
      />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!disconnectMutation.isPending) {
            setConfirmOpen(open)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Desvincular esta institución de Gmail?
            </AlertDialogTitle>
            <AlertDialogDescription>
              No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={disconnectMutation.isPending}
              onClick={() => void onDisconnect()}
            >
              Desvincular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
