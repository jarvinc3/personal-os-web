"use client"

import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useStartGmailOAuth } from "@/src/modules/finance/hooks/use-gmail-oauth"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  buildLedgerTargetOptions,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import type {
  FinanceAccount,
  FinanceCard,
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
  bankDomain: z.string().max(150),
  label: z.string().max(120),
})

type FormValues = z.infer<typeof schema>

type ConnectGmailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  accounts: FinanceAccount[]
  cards: FinanceCard[]
}

export function ConnectGmailSheet({
  open,
  onOpenChange,
  accounts,
  cards,
}: ConnectGmailSheetProps) {
  const startOAuth = useStartGmailOAuth()
  const hasTargets = accounts.length > 0 || cards.length > 0
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
    defaultValues: {
      target: CATALOG_NONE,
      bankDomain: "bhd.com.do",
      label: "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        target: CATALOG_NONE,
        bankDomain: "bhd.com.do",
        label: "",
      })
    }
  }, [open, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    const target = splitLedgerTarget(values.target)
    try {
      await startOAuth.mutateAsync({
        ...target,
        bankDomain: values.bankDomain,
        label: values.label,
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
      description="Solo lectura (gmail.readonly). Eliges cuenta o tarjeta, no ambas. Vuelves a esta app, no a un deep link de móvil."
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
            disabled={startOAuth.isPending || !hasTargets}
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
        <Controller
          control={control}
          name="target"
          render={({ field }) => (
            <SelectField
              label="Cuenta o tarjeta"
              value={field.value}
              onChange={field.onChange}
              options={
                hasTargets
                  ? targetOptions
                  : [{ value: "", label: "Crea una cuenta o tarjeta primero" }]
              }
              disabled={!hasTargets}
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
