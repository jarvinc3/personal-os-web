"use client"

import { institutionSelectOptions } from "@/src/modules/finance/components/ledger-target-select"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useCreateEmailSource } from "@/src/modules/finance/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type {
  FinanceInstitution,
  FinanceMailbox,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  FormTextField,
  SelectField,
} from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  mailboxId: z.string().min(1, "Elige un correo"),
  institutionId: z.string().min(1, "Elige una institución"),
  bankSenderEmail: z
    .string()
    .trim()
    .email("Correo de notificaciones inválido")
    .max(150),
  label: z.string().max(120),
})

type FormValues = z.infer<typeof schema>

type LinkInstitutionMailboxSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mailboxes: FinanceMailbox[]
  institutions: FinanceInstitution[]
  mailboxId?: string | null
  institutionId?: string | null
  emailSyncEnabled: boolean
}

export function LinkInstitutionMailboxSheet({
  open,
  onOpenChange,
  mailboxes,
  institutions,
  mailboxId,
  institutionId,
  emailSyncEnabled,
}: LinkInstitutionMailboxSheetProps) {
  const createSource = useCreateEmailSource()
  const mailboxOptions = mailboxes.map((item) => ({
    value: item.id,
    label: item.emailAddress,
  }))
  const linkedInstitutionIds = new Set(
    mailboxes.flatMap((mailbox) =>
      mailbox.sources
        .filter((source) => source.isActive)
        .map((source) => source.institutionId),
    ),
  )
  const institutionOptions = institutionSelectOptions(
    institutions.filter(
      (item) =>
        item.isActive &&
        (!linkedInstitutionIds.has(item.id) || item.id === institutionId),
    ),
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mailboxId: mailboxId ?? mailboxOptions[0]?.value ?? "",
      institutionId: institutionId ?? institutionOptions[0]?.value ?? CATALOG_NONE,
      bankSenderEmail: "",
      label: "",
    },
  })

  const defaultMailboxId = mailboxId ?? mailboxes[0]?.id ?? ""
  const defaultInstitutionId =
    institutionId ??
    institutions.find(
      (item) => item.isActive && !linkedInstitutionIds.has(item.id),
    )?.id ??
    ""

  useEffect(() => {
    if (!open) return
    reset({
      mailboxId: defaultMailboxId,
      institutionId: defaultInstitutionId,
      bankSenderEmail: "",
      label: "",
    })
  }, [open, defaultMailboxId, defaultInstitutionId, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    if (!emailSyncEnabled) {
      appToast.error({
        text1: "Sincronización de correo desactivada",
        text2: "Actívala en Ajustes → Finanzas.",
      })
      return
    }
    const mailbox = mailboxes.find((item) => item.id === values.mailboxId)
    if (!mailbox) {
      appToast.error({ text1: "Elige un correo conectado" })
      return
    }
    try {
      await createSource.mutateAsync({
        emailAddress: mailbox.emailAddress,
        institutionId: values.institutionId,
        bankSenderEmail: values.bankSenderEmail.trim(),
        label: values.label.trim() || undefined,
      })
      appToast.success({ text1: "Institución vinculada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  const lockMailbox = Boolean(mailboxId)
  const lockInstitution = Boolean(institutionId)

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Vincular institución"
      description="Elige el Gmail y el correo From con el que el banco avisa los movimientos."
      actions={{
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
            disabled={
              createSource.isPending ||
              !emailSyncEnabled ||
              mailboxOptions.length === 0 ||
              institutionOptions.length === 0
            }
            className="flex-1"
            onClick={onSubmit}
          >
            {createSource.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Vincular
          </Button>
        ),
      }}
    >
      {mailboxOptions.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Primero conecta Gmail en Correos. Desde aquí no se abre Google.
          </p>
          <Button asChild>
            <Link href={APP_ROUTES.app.financeSync}>Ir a Correos</Link>
          </Button>
        </div>
      ) : (
        <SummarySection title="Vínculo" icon={MailIcon}>
          <Controller
            control={control}
            name="mailboxId"
            render={({ field }) => (
              <SelectField
                label="Gmail"
                value={field.value}
                onChange={field.onChange}
                options={mailboxOptions}
                disabled={lockMailbox}
              />
            )}
          />
          {errors.mailboxId?.message ? (
            <p className="text-sm text-destructive">{errors.mailboxId.message}</p>
          ) : null}
          <Controller
            control={control}
            name="institutionId"
            render={({ field }) => (
              <SelectField
                label="Institución"
                value={field.value}
                onChange={field.onChange}
                options={
                  institutionOptions.length > 0
                    ? institutionOptions
                    : [{ value: "", label: "No hay instituciones libres" }]
                }
                disabled={lockInstitution || institutionOptions.length === 0}
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
      )}
    </BottomSheet>
  )
}
