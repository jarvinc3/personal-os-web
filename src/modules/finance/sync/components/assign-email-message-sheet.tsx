"use client"

import { DestinationPickerSheet } from "@/src/modules/finance/shared/components/pickers/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/shared/components/pickers/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import {
  useAssignPendingEmail,
  useRetryPendingEmail,
} from "@/src/modules/finance/shared/hooks/use-email-sources"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { splitLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
  FinancePendingEmailMessage,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/src/shared/components/ui/field"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { usePicker } from "@/src/shared/hooks/use-picker"
import { zodResolver } from "@hookform/resolvers/zod"
import { InboxIcon, RefreshCwIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  assignEmailMessageSchema,
  type AssignEmailMessageFormValues,
} from "@/src/modules/finance/sync/lib/assign-email-message-form"

type AssignEmailMessageSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: FinancePendingEmailMessage | null
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  institutions: FinanceInstitution[]
  display: FinanceMoneyDisplay
  pending?: boolean
}

export function AssignEmailMessageSheet({
  open,
  onOpenChange,
  message,
  accounts,
  cards,
  institutions,
  display,
  pending = false,
}: AssignEmailMessageSheetProps) {
  const assignMutation = useAssignPendingEmail()
  const retryMutation = useRetryPendingEmail()
  const isPending = assignMutation.isPending || retryMutation.isPending
  const { picker, openPicker, closeHandlerFor } = usePicker<"none" | "target">(
    "none"
  )

  const messageInstitutions = useMemo(
    () =>
      institutions.filter(
        (institution) => institution.id === message?.institutionId
      ),
    [institutions, message?.institutionId]
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssignEmailMessageFormValues>({
    resolver: zodResolver(assignEmailMessageSchema),
    defaultValues: { target: CATALOG_NONE },
  })

  useEffect(() => {
    if (open) {
      reset({ target: CATALOG_NONE })
    }
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
    if (!message) {
      return
    }
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
    if (!message) {
      return
    }
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
    <>
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
              <XIcon className="size-4 shrink-0" />
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
            <RefreshCwIcon className="size-4 shrink-0" />
            Reintentar coincidencia
          </Button>
          <Controller
            control={control}
            name="target"
            render={({ field }) => (
              <Field className="gap-1">
                <FieldLabel className="text-sm text-muted-foreground">
                  Cuenta o tarjeta
                </FieldLabel>
                <DestinationTrigger
                  destination={field.value}
                  accounts={accounts}
                  cards={cards}
                  display={display}
                  onClick={() => openPicker("target")}
                />
                {errors.target?.message ? (
                  <FieldError>{errors.target.message}</FieldError>
                ) : null}
              </Field>
            )}
          />
        </SummarySection>
      </BottomSheet>

      <DestinationPickerSheet
        open={picker === "target"}
        onOpenChange={closeHandlerFor("target")}
        institutions={messageInstitutions}
        accounts={accounts}
        cards={cards}
        display={display}
        onSelect={(next) => setValue("target", next, { shouldValidate: true })}
      />
    </>
  )
}
