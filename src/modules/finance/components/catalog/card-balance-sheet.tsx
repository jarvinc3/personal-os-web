"use client"

import { CurrencySelectField } from "@/src/modules/finance/components/catalog/currency-select-field"
import { useUpdateCardBalance } from "@/src/modules/finance/hooks/use-cards"
import { buildCardBalanceBody } from "@/src/modules/finance/lib/catalog-payloads"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import type { FinanceCard } from "@/src/modules/finance/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { SummarySection } from "@/src/shared/components/layout/summary"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { WalletIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  balance: z.string().trim().min(1, "Saldo obligatorio"),
  creditLimit: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

function toFormValues(card: FinanceCard | null, defaultCurrency: string): FormValues {
  const primary = card?.balances[0]
  return {
    currency: primary?.currency ?? defaultCurrency,
    balance: primary?.balance ?? "",
    creditLimit: primary?.creditLimit ?? "",
  }
}

type CardBalanceSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: FinanceCard | null
  defaultCurrency: string
}

export function CardBalanceSheet({
  open,
  onOpenChange,
  card,
  defaultCurrency,
}: CardBalanceSheetProps) {
  const mutation = useUpdateCardBalance()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(card, defaultCurrency),
  })

  useEffect(() => {
    if (open) {
      reset(toFormValues(card, defaultCurrency))
    }
  }, [open, card, defaultCurrency, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit],
  )

  const onSubmit = submitForm(async (values) => {
    if (!card) return
    const payload = buildCardBalanceBody(values)
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await mutation.mutateAsync({ id: card.id, body: payload.body })
      appToast.success({ text1: "Saldo actualizado" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={card ? `Saldo · ${card.name}` : "Saldo de tarjeta"}
      description="El API espera números en el body. Un saldo inválido no se envía."
      actions={{
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
          <Button
            disabled={mutation.isPending || !card}
            className="flex-1"
            onClick={onSubmit}
          >
            {mutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        ),
      }}
    >
      <SummarySection title="Saldo" icon={WalletIcon}>
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <CurrencySelectField
              label="Moneda"
              value={field.value}
              onChange={field.onChange}
              enabled={open}
              extraCodes={[defaultCurrency]}
            />
          )}
        />
        <Controller
          control={control}
          name="balance"
          render={({ field }) => (
            <FormTextField
              label="Saldo"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.balance?.message}
              placeholder="0.00"
            />
          )}
        />
        {card?.type === "CREDIT" ? (
          <Controller
            control={control}
            name="creditLimit"
            render={({ field }) => (
              <FormTextField
                label="Límite de crédito"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.creditLimit?.message}
                placeholder="50000"
              />
            )}
          />
        ) : null}
      </SummarySection>
    </BottomSheet>
  )
}
