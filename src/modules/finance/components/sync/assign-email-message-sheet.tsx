"use client"

import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import {
  useAssignPendingEmail,
  useRetryPendingEmail,
} from "@/src/modules/finance/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  buildLedgerTargetOptions,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinancePendingEmailMessage,
} from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { SelectField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InboxIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  target: z.string().min(1, "Elige una cuenta o una tarjeta"),
})

type FormValues = z.infer<typeof schema>

type AssignEmailMessageSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: FinancePendingEmailMessage | null
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  display: FinanceMoneyDisplay
  pending?: boolean
}

export function AssignEmailMessageSheet({
  open,
  onOpenChange,
  message,
  accounts,
  cards,
  display,
  pending = false,
}: AssignEmailMessageSheetProps) {
  const assignMutation = useAssignPendingEmail()
  const retryMutation = useRetryPendingEmail()
  const isPending = assignMutation.isPending || retryMutation.isPending

  const institutionAccounts = useMemo(
    () =>
      accounts.filter(
        (item) => item.isActive && item.institutionId === message?.institutionId
      ),
    [accounts, message?.institutionId]
  )
  const institutionCards = useMemo(
    () =>
      cards.filter(
        (item) => item.isActive && item.institutionId === message?.institutionId
      ),
    [cards, message?.institutionId]
  )
  const targetOptions = useMemo(
    () => buildLedgerTargetOptions(institutionAccounts, institutionCards),
    [institutionAccounts, institutionCards]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { target: CATALOG_NONE },
  })

  useEffect(() => {
    if (open) reset({ target: CATALOG_NONE })
  }, [open, message, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const extracted = message?.extractedPayload
  const summary = extracted
    ? [
        extracted.type,
        extracted.amount != null
          ? formatFinanceMoney(extracted.amount, {
              ...display,
              currency: extracted.currency ?? display.currency,
            })
          : null,
        extracted.merchant,
      ]
        .filter(Boolean)
        .join(" · ")
    : (message?.reason ?? "Sin extracto")

  const onSubmit = submitForm(async (values) => {
    if (!message) return
    const target = splitLedgerTarget(values.target)
    if (!target.accountId && !target.cardId) {
      appToast.error({ text1: "Elige una cuenta o una tarjeta" })
      return
    }
    try {
      await assignMutation.mutateAsync({ id: message.id, body: target })
      appToast.success({ text1: "Movimiento asignado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  async function onRetry() {
    if (!message) return
    try {
      const result = await retryMutation.mutateAsync(message.id)
      if (result && "assigned" in result && result.assigned) {
        appToast.success({ text1: "Movimiento asignado" })
        onOpenChange(false)
        return
      }
      appToast.info({
        text1: "Sigue pendiente",
        text2: "Elige cuenta o tarjeta a mano.",
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      title="Asignar movimiento"
      description={
        message
          ? `${message.institutionName} · ${message.emailAddress}`
          : "Elige el destino contable."
      }
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
            disabled={isPending || !message}
            className="flex-1"
            onClick={onSubmit}
          >
            {isPending ? <Spinner data-icon="inline-start" /> : null}
            Confirmar
          </Button>
        ),
      }}
    >
      <SummarySection title="Extracto" icon={InboxIcon}>
        <p className="text-sm text-muted-foreground">{summary}</p>
        {extracted?.description ? (
          <p className="text-sm">{extracted.description}</p>
        ) : null}
        {extracted?.notes ? (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Notas</p>
            <p className="text-sm whitespace-pre-wrap">{extracted.notes}</p>
          </div>
        ) : null}
        {message?.reason ? (
          <p className="text-sm text-muted-foreground">{message.reason}</p>
        ) : null}
        {message?.lastFourHint ? (
          <p className="text-sm">Últimos dígitos: {message.lastFourHint}</p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || !message}
          onClick={() => void onRetry()}
        >
          Reintentar coincidencia
        </Button>
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
      </SummarySection>
    </BottomSheet>
  )
}
