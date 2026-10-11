"use client"

import { useAdjustBalance } from "@/src/modules/finance/shared/hooks/use-balance-adjustment"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import { createSheetSubmit } from "@/src/shared/lib/sheet-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SaveIcon, ScaleIcon, XIcon } from "lucide-react"
import { useEffect, useMemo } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  accountBalanceSchema,
  type AccountBalanceFormValues,
} from "@/src/modules/finance/catalog/lib/account-balance-form"

type AccountBalanceSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: FinanceAccount | null
  display: FinanceMoneyDisplay
}

export function AccountBalanceSheet({
  open,
  onOpenChange,
  account,
  display,
}: AccountBalanceSheetProps) {
  const mutation = useAdjustBalance()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountBalanceFormValues>({
    resolver: zodResolver(accountBalanceSchema),
    defaultValues: { balance: account?.balance ?? "" },
  })

  useEffect(() => {
    if (!open) {
      return
    }
    reset({ balance: account?.balance ?? "" })
  }, [open, account?.balance, reset])

  const submitForm = useMemo(
    () => createSheetSubmit(handleSubmit),
    [handleSubmit]
  )

  const onSubmit = submitForm(async (values) => {
    if (!account) {
      return
    }
    const balance = parseFinanceMoney(values.balance)
    if (balance === null) {
      appToast.error({ text1: "Saldo inválido" })
      return
    }
    try {
      const result = await mutation.mutateAsync({
        accountId: account.id,
        balance,
      })
      appToast.success({
        text1: result.adjusted ? "Saldo reajustado" : "El saldo no cambió",
      })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={mutation.isPending}
      title={account ? `Ajustar saldo · ${account.name}` : "Ajustar saldo"}
      description="El cambio queda como un reajuste. No cuenta como ingreso ni gasto."
      actions={{
        close: (
          <Button
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
            className="flex-1"
            disabled={mutation.isPending || !account}
            onClick={onSubmit}
          >
            {mutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon className="size-4 shrink-0" />
            )}
            {mutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Saldo" icon={ScaleIcon}>
        <p className="px-1 text-sm text-muted-foreground">
          Saldo actual{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatFinanceMoney(account?.balance, {
              ...display,
              currency: account?.currency ?? display.currency,
            })}
          </span>
        </p>
        <Controller
          control={control}
          name="balance"
          render={({ field }) => (
            <FormTextField
              icon={ScaleIcon}
              label="Saldo nuevo"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.balance?.message}
              placeholder="0.00"
            />
          )}
        />
      </SummarySection>
    </BottomSheet>
  )
}
