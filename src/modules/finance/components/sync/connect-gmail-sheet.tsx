"use client"

import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useStartGmailOAuth } from "@/src/modules/finance/hooks/use-gmail-oauth"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { GmailOAuthNextPath } from "@/src/modules/finance/lib/gmail-oauth"
import type { FinanceInstitution } from "@/src/modules/finance/types/entities"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
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
  institutionId: z.string().min(1, "Elige una institución"),
  bankDomain: z.string().max(150),
  label: z.string().max(120),
})

type FormValues = z.infer<typeof schema>

type ConnectGmailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  institutions: FinanceInstitution[]
  nextPath?: GmailOAuthNextPath
  emailSyncEnabled: boolean
}

export function ConnectGmailSheet({
  open,
  onOpenChange,
  institutions,
  nextPath = APP_ROUTES.app.financeSync,
  emailSyncEnabled,
}: ConnectGmailSheetProps) {
  const startOAuth = useStartGmailOAuth()
  const institutionOptions = institutions
    .filter((item) => item.isActive)
    .map((item) => ({ value: item.id, label: item.name }))
  const hasInstitutions = institutionOptions.length > 0

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      institutionId: institutionOptions[0]?.value ?? CATALOG_NONE,
      bankDomain: "bhd.com.do",
      label: "",
    },
  })

  const defaultInstitutionId = institutions.find((item) => item.isActive)?.id ?? CATALOG_NONE

  useEffect(() => {
    if (open) {
      reset({
        institutionId: defaultInstitutionId,
        bankDomain: "bhd.com.do",
        label: "",
      })
    }
  }, [open, reset, defaultInstitutionId])

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
    try {
      await startOAuth.mutateAsync({
        institutionId: values.institutionId,
        bankDomain: values.bankDomain,
        label: values.label,
        nextPath,
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Conectar Gmail"
      description="Solo lectura (gmail.readonly). Eliges la institución del banco. Vuelves a esta app, no a un deep link de móvil."
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
            disabled={startOAuth.isPending || !hasInstitutions || !emailSyncEnabled}
            className="flex-1"
            onClick={onSubmit}
          >
            {startOAuth.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Ir a Google
          </Button>
        ),
      }}
    >
      <SummarySection title="Origen" icon={MailIcon}>
        {!emailSyncEnabled ? (
          <p className="text-sm text-destructive">
            Activa la sincronización de correo en Ajustes antes de conectar
            Gmail.
          </p>
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
                hasInstitutions
                  ? institutionOptions
                  : [{ value: "", label: "Crea una institución primero" }]
              }
              disabled={!hasInstitutions}
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
          name="bankDomain"
          render={({ field }) => (
            <FormTextField
              label="Dominio del banco"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="bhd.com.do"
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
              placeholder="Nómina"
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
