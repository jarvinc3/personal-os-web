"use client"

import { FinanceDateField } from "@/src/modules/finance/shared/components/forms/date-field"
import { FinanceMoneyField } from "@/src/modules/finance/shared/components/forms/money-field"
import {
  useCreateReconciliation,
  useReconciliationPreview,
} from "@/src/modules/finance/shared/hooks/use-reconciliations"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import { todayDateInput } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  EMPTY_RECONCILIATION_LINE,
  reconciliationDifference,
  reconciliationLinePayloads,
  reconciliationLinesFromSuggestion,
  reconciliationLinesMatchDifference,
  reconciliationLinesTotal,
} from "@/src/modules/finance/shared/lib/reconciliation"
import {
  FINANCE_RECONCILIATION_KIND_LABEL,
  FINANCE_RECONCILIATION_KINDS,
  type FinanceReconciliationKind,
  type FinanceReconciliationLineDraft,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import { Button } from "@/src/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"
import {
  LandmarkIcon,
  PlusIcon,
  SaveIcon,
  ScaleIcon,
  TagsIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

export type ReconciliationSheetTarget = {
  kind: "account" | "card"
  id: string
  currency: string
  name: string
  balance: string
}

type ReconciliationSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  target: ReconciliationSheetTarget
  display: FinanceMoneyDisplay
}

export function ReconciliationSheet({
  open,
  onOpenChange,
  target,
  display,
}: ReconciliationSheetProps) {
  const createMutation = useCreateReconciliation()
  const [realBalance, setRealBalance] = useState(target.balance)
  const [asOfDate, setAsOfDate] = useState(todayDateInput())
  const [editedLines, setEditedLines] = useState<
    FinanceReconciliationLineDraft[] | null
  >(null)
  const [previousTargetKey, setPreviousTargetKey] = useState(
    `${open}:${target.kind}:${target.id}`
  )

  // Resets the sheet while rendering when it opens or the product changes.
  const targetKey = `${open}:${target.kind}:${target.id}`
  if (targetKey !== previousTargetKey) {
    setPreviousTargetKey(targetKey)
    setRealBalance(target.balance)
    setAsOfDate(todayDateInput())
    setEditedLines(null)
  }

  const previewBody = useMemo(() => {
    const parsed = parseFinanceMoney(realBalance)
    if (parsed === null || !asOfDate) {
      return null
    }
    return {
      ...(target.kind === "account"
        ? { accountId: target.id }
        : { cardId: target.id }),
      ...(target.kind === "card" ? { currency: target.currency } : {}),
      asOfDate,
      realBalance: parsed,
    }
  }, [realBalance, asOfDate, target])

  const previewQuery = useReconciliationPreview(open, previewBody)
  const moneyDisplay = { ...display, currency: target.currency }

  const lines =
    editedLines ??
    reconciliationLinesFromSuggestion(
      previewQuery.data?.suggestedAdjustments ?? []
    )

  const appBalance = previewQuery.data?.appBalance ?? target.balance
  const difference = reconciliationDifference(appBalance, realBalance)
  const linesTotal = reconciliationLinesTotal(lines)
  const matches = reconciliationLinesMatchDifference(lines, difference)
  const needsLines = difference !== null && difference !== 0
  const canSubmit =
    previewBody !== null &&
    difference !== null &&
    (!needsLines || matches) &&
    !createMutation.isPending

  function updateLine(
    index: number,
    next: Partial<FinanceReconciliationLineDraft>
  ) {
    setEditedLines((current) => {
      const base =
        current ??
        reconciliationLinesFromSuggestion(
          previewQuery.data?.suggestedAdjustments ?? []
        )
      return base.map((line, position) =>
        position === index ? { ...line, ...next } : line
      )
    })
  }

  async function onSubmit() {
    if (!previewBody) {
      appToast.error({ text1: "Escribe el saldo real del banco" })
      return
    }
    if (!canSubmit) {
      appToast.error({ text1: "Los ajustes deben sumar la diferencia" })
      return
    }
    try {
      await createMutation.mutateAsync({
        ...previewBody,
        adjustments: needsLines ? reconciliationLinePayloads(lines) : [],
      })
      appToast.success({ text1: "Cuenta conciliada" })
      onOpenChange(false)
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      pending={createMutation.isPending}
      title={`Conciliar · ${target.name}`}
      description="Escribe el saldo que ves en el banco. La diferencia queda como ajustes categorizados."
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
            disabled={!canSubmit}
            onClick={() => void onSubmit()}
          >
            {createMutation.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <SaveIcon className="size-4 shrink-0" />
            )}
            {createMutation.isPending ? "Guardando..." : "Conciliar"}
          </Button>
        ),
      }}
    >
      <SummarySection title="Saldo" icon={ScaleIcon}>
        <p className="px-1 text-sm text-muted-foreground">
          Saldo en la app{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatFinanceMoney(appBalance, moneyDisplay)}
          </span>
        </p>
        <FinanceMoneyField
          label="Saldo real del banco"
          amount={realBalance}
          onAmountChange={setRealBalance}
          onAmountCommit={setRealBalance}
          currency={target.currency}
        />
        <FinanceDateField
          label="Fecha de corte"
          value={asOfDate}
          onChange={setAsOfDate}
        />
        {difference !== null ? (
          <p className="px-1 text-sm text-muted-foreground">
            Diferencia{" "}
            <span
              className={
                difference === 0
                  ? "font-medium text-foreground tabular-nums"
                  : "font-medium text-destructive tabular-nums"
              }
            >
              {formatFinanceMoney(difference, {
                ...moneyDisplay,
                leadingSign: true,
              })}
            </span>
          </p>
        ) : null}
      </SummarySection>

      {needsLines ? (
        <SummarySection title="Reparto" icon={LandmarkIcon}>
          <p className="px-1 text-sm text-muted-foreground">
            Los ajustes deben sumar{" "}
            <span className="font-medium text-foreground tabular-nums">
              {formatFinanceMoney(difference ?? 0, {
                ...moneyDisplay,
                leadingSign: true,
              })}
            </span>
            . Llevas{" "}
            <span
              className={
                matches
                  ? "font-medium text-[var(--success)] tabular-nums"
                  : "font-medium text-destructive tabular-nums"
              }
            >
              {formatFinanceMoney(linesTotal, {
                ...moneyDisplay,
                leadingSign: true,
              })}
            </span>
            .
          </p>
          {lines.map((line, index) => (
            <div key={index} className="flex items-end gap-2 px-1">
              <div className="flex-1">
                <Select
                  value={line.kind}
                  onValueChange={(value) =>
                    updateLine(index, {
                      kind: value as FinanceReconciliationKind,
                    })
                  }
                >
                  <SelectTrigger className="relative w-full cursor-pointer pl-9">
                    <TagsIcon className="pointer-events-none absolute left-3 size-4.5 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FINANCE_RECONCILIATION_KINDS.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {FINANCE_RECONCILIATION_KIND_LABEL[kind]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <FinanceMoneyField
                  label="Monto"
                  amount={line.amount}
                  onAmountChange={(value) =>
                    updateLine(index, { amount: value })
                  }
                  onAmountCommit={(value) =>
                    updateLine(index, { amount: value })
                  }
                  currency={target.currency}
                />
              </div>
              {lines.length > 1 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Quitar línea"
                  onClick={() =>
                    setEditedLines(
                      lines.filter((_, position) => position !== index)
                    )
                  }
                >
                  <Trash2Icon className="size-4" />
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            variant="outline"
            className="mx-1"
            onClick={() =>
              setEditedLines([...lines, { ...EMPTY_RECONCILIATION_LINE }])
            }
          >
            <PlusIcon className="size-4 shrink-0" />
            Añadir línea
          </Button>
        </SummarySection>
      ) : null}
    </BottomSheet>
  )
}
