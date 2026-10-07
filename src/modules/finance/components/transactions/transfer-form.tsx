"use client"

import { CurrencyTriggerLabel } from "@/src/modules/finance/components/currency-flag"
import { FinanceDateField } from "@/src/modules/finance/components/forms/finance-date-field"
import { FinanceAmountField } from "@/src/modules/finance/components/forms/finance-form-blocks"
import { AmountCalculatorSheet } from "@/src/modules/finance/components/transactions/amount-calculator-sheet"
import { CurrencyPickerSheet } from "@/src/modules/finance/components/transactions/currency-picker-sheet"
import { DestinationPickerSheet } from "@/src/modules/finance/components/transactions/destination-picker-sheet"
import { DestinationTrigger } from "@/src/modules/finance/components/transactions/destination-trigger"
import { CATALOG_NONE } from "@/src/modules/finance/constants/catalog"
import { useAccounts } from "@/src/modules/finance/hooks/use-accounts"
import { useCards } from "@/src/modules/finance/hooks/use-cards"
import { useInstitutions } from "@/src/modules/finance/hooks/use-institutions"
import { useCreateTransfer } from "@/src/modules/finance/hooks/use-transactions"
import { buildDestinationPickerGroups } from "@/src/modules/finance/lib/destination-picker"
import type { DestinationPickerGroup } from "@/src/modules/finance/lib/destination-picker"
import { financeErrorMessage } from "@/src/modules/finance/lib/finance-error"
import {
  currencyForTarget,
  todayDateInput,
} from "@/src/modules/finance/lib/ledger-form"
import {
  buildCreateTransferBody,
  encodeLedgerTarget,
  splitLedgerTarget,
} from "@/src/modules/finance/lib/ledger-payloads"
import { narrowCurrencySymbol } from "@/src/modules/finance/lib/money"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money"
import { FormTextField } from "@/src/shared/components/layout/form-blocks"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { Switch } from "@/src/shared/components/ui/switch"
import { appToast } from "@/src/shared/lib/app-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeftRightIcon,
  CalculatorIcon,
  FileTextIcon,
  InfoIcon,
  KeyboardIcon,
  NotebookPenIcon,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

const schema = z
  .object({
    amount: z.string().trim().min(1, "Monto obligatorio"),
    currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
    transactionDate: z.string().trim().min(1, "Fecha obligatoria"),
    fromTarget: z.string().min(1, "Elige origen"),
    toTarget: z.string().min(1, "Elige destino"),
    status: z.enum(["PENDING", "CONFIRMED"]),
    description: z.string(),
    notes: z.string(),
  })
  .refine((values) => values.fromTarget !== values.toTarget, {
    path: ["toTarget"],
    message: "Origen y destino tienen que ser distintos",
  })

type FormValues = z.infer<typeof schema>
type Picker = "none" | "from" | "to" | "currency" | "calculator"

function collectLedgerTargets(groups: DestinationPickerGroup[]): string[] {
  const targets: string[] = []
  for (const group of groups) {
    if (group.kind === "cash") {
      targets.push(encodeLedgerTarget("account", group.account.id))
    }
  }
  for (const group of groups) {
    if (group.kind !== "institution") continue
    for (const account of group.accounts) {
      targets.push(encodeLedgerTarget("account", account.id))
    }
    for (const card of group.cards) {
      targets.push(encodeLedgerTarget("card", card.id))
    }
  }
  return targets
}

type TransferFormProps = {
  defaultCurrency: string
  enabled: boolean
  display: FinanceMoneyDisplay
  onDone: () => void
}

export function TransferForm({
  defaultCurrency,
  enabled,
  display,
  onDone,
}: TransferFormProps) {
  const createMutation = useCreateTransfer()
  const accountsQuery = useAccounts(enabled)
  const cardsQuery = useCards(enabled)
  const institutionsQuery = useInstitutions(enabled)
  const accounts = useMemo(() => accountsQuery.data ?? [], [accountsQuery.data])
  const cards = useMemo(() => cardsQuery.data ?? [], [cardsQuery.data])
  const institutions = useMemo(
    () => institutionsQuery.data ?? [],
    [institutionsQuery.data],
  )
  const groups = useMemo(
    () => buildDestinationPickerGroups({ institutions, accounts, cards }),
    [institutions, accounts, cards],
  )
  const canTransfer = accounts.length + cards.length >= 2
  const targetsReady =
    accountsQuery.isSuccess && cardsQuery.isSuccess && institutionsQuery.isSuccess
  const [picker, setPicker] = useState<Picker>("none")
  const [amountMode, setAmountMode] = useState<"keyboard" | "calculator">(
    "keyboard",
  )
  const currencyFrom = useRef<string | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      currency: defaultCurrency,
      transactionDate: todayDateInput(),
      fromTarget: CATALOG_NONE,
      toTarget: CATALOG_NONE,
      status: "CONFIRMED",
      description: "",
      notes: "",
    },
  })

  const fromTarget = useWatch({ control, name: "fromTarget" })
  const toTarget = useWatch({ control, name: "toTarget" })
  const amount = useWatch({ control, name: "amount" })
  const currency = useWatch({ control, name: "currency" })

  useEffect(() => {
    if (!targetsReady) return
    const targets = collectLedgerTargets(groups)
    const currentFrom = getValues("fromTarget")
    const currentTo = getValues("toTarget")
    if (!currentFrom || currentFrom === CATALOG_NONE) {
      const nextFrom = targets[0]
      if (nextFrom) setValue("fromTarget", nextFrom)
    }
    if (!currentTo || currentTo === CATALOG_NONE) {
      const from = getValues("fromTarget")
      const nextTo = targets.find((target) => target !== from) ?? targets[1]
      if (nextTo) setValue("toTarget", nextTo)
    }
  }, [groups, getValues, setValue, targetsReady])

  useEffect(() => {
    if (currencyFrom.current === fromTarget) return
    currencyFrom.current = fromTarget
    setValue(
      "currency",
      currencyForTarget(fromTarget, accounts, cards, defaultCurrency),
    )
  }, [fromTarget, accounts, cards, defaultCurrency, setValue])

  const onSubmit = handleSubmit(async (values) => {
    const from = splitLedgerTarget(values.fromTarget)
    const to = splitLedgerTarget(values.toTarget)
    const payload = buildCreateTransferBody({
      amount: values.amount,
      currency: values.currency,
      transactionDate: values.transactionDate,
      description: values.description,
      notes: values.notes,
      status: values.status,
      fromAccountId: from.accountId,
      fromCardId: from.cardId,
      toAccountId: to.accountId,
      toCardId: to.cardId,
    })
    if (!payload.ok) {
      appToast.error({ text1: payload.error })
      return
    }
    try {
      await createMutation.mutateAsync(payload.body)
      appToast.success({ text1: "Transferencia creada" })
      onDone()
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  })

  return (
    <>
      <form
        className="-mb-4 flex h-[calc(100dvh-var(--header-height)-1rem)] flex-col gap-4 md:-mb-16"
        onSubmit={onSubmit}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
          <SummarySection title="Ruta" icon={ArrowLeftRightIcon}>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Origen</span>
              <DestinationTrigger
                destination={fromTarget}
                accounts={accounts}
                cards={cards}
                disabled={!canTransfer}
                placeholder="Elige origen"
                onClick={() => setPicker("from")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm text-muted-foreground">Destino</span>
              <DestinationTrigger
                destination={toTarget}
                accounts={accounts}
                cards={cards}
                disabled={!canTransfer}
                placeholder="Elige destino"
                onClick={() => setPicker("to")}
              />
              {errors.toTarget?.message ? (
                <p className="text-sm text-destructive">{errors.toTarget.message}</p>
              ) : null}
            </div>
          </SummarySection>

          <SummarySection title="Importe" icon={ArrowLeftRightIcon}>
            <div>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <FinanceAmountField
                        label={null}
                        prefix={narrowCurrencySymbol(currency || defaultCurrency)}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.amount?.message}
                        readOnly={amountMode === "calculator"}
                        onReadOnlyActivate={() => setPicker("calculator")}
                        trailing={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-pressed={amountMode === "calculator"}
                            aria-label={
                              amountMode === "calculator"
                                ? "Usar teclado"
                                : "Abrir calculadora"
                            }
                            onClick={() => {
                              if (amountMode === "keyboard") {
                                setAmountMode("calculator")
                                setPicker("calculator")
                                return
                              }
                              setAmountMode("keyboard")
                              if (picker === "calculator") setPicker("none")
                            }}
                          >
                            {amountMode === "calculator" ? (
                              <CalculatorIcon />
                            ) : (
                              <KeyboardIcon />
                            )}
                          </Button>
                        }
                      />
                    )}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 shrink-0 rounded-2xl px-3 text-base"
                  onClick={() => setPicker("currency")}
                >
                  <CurrencyTriggerLabel code={currency || defaultCurrency} />
                </Button>
              </div>
              {errors.currency?.message ? (
                <p className="text-sm text-destructive">{errors.currency.message}</p>
              ) : null}
            </div>

            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Controller
                  control={control}
                  name="transactionDate"
                  render={({ field }) => (
                    <FinanceDateField
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.transactionDate?.message}
                    />
                  )}
                />
              </div>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3">
                    <span className="text-sm font-medium">Completado</span>
                    <Switch
                      checked={field.value === "CONFIRMED"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "CONFIRMED" : "PENDING")
                      }
                      aria-label="Completado"
                    />
                  </label>
                )}
              />
            </div>
          </SummarySection>

          <SummarySection
            title="Detalles opcionales"
            icon={InfoIcon}
            collapsible
          >
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <FormTextField
                  label="Descripción"
                  icon={FileTextIcon}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="notes"
              render={({ field }) => (
                <FormTextField
                  label="Notas"
                  icon={NotebookPenIcon}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </SummarySection>

          {!canTransfer && targetsReady ? (
            <p className="text-sm text-muted-foreground">
              Necesitas al menos dos cuentas o tarjetas distintas.
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t bg-background px-0 pt-3 pb-4">
          <Button
            type="submit"
            className="h-11 w-full"
            disabled={createMutation.isPending || !canTransfer}
          >
            {createMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
            Transferir
          </Button>
        </div>
      </form>

      <AmountCalculatorSheet
        open={picker === "calculator"}
        onOpenChange={(open) => {
          setPicker((current) => {
            if (open) return "calculator"
            return current === "calculator" ? "none" : current
          })
        }}
        amount={amount}
        currency={currency || defaultCurrency}
        onCommit={(next) => setValue("amount", next, { shouldValidate: true })}
      />
      <CurrencyPickerSheet
        open={picker === "currency"}
        onOpenChange={(open) => {
          if (open) return
          setPicker((current) => (current === "currency" ? "none" : current))
        }}
        value={currency || defaultCurrency}
        enabled={enabled}
        onSelect={(next) => setValue("currency", next)}
      />
      <DestinationPickerSheet
        open={picker === "from" || picker === "to"}
        onOpenChange={(open) => {
          if (open) return
          setPicker((current) =>
            current === "from" || current === "to" ? "none" : current,
          )
        }}
        institutions={institutions}
        accounts={accounts}
        cards={cards}
        display={{ ...display, currency: currency || display.currency }}
        onSelect={(next) => {
          const field = picker === "to" ? "toTarget" : "fromTarget"
          setValue(field, next, { shouldValidate: true })
        }}
      />
    </>
  )
}
