"use client"

import { GlossaryHelpButton } from "@/src/modules/help"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import {
  pendingReconciliationItems,
  reconciliationSubtitle,
} from "@/src/modules/finance/shared/lib/reconciliation-pending"
import type {
  FinanceBalanceDrift,
  FinanceReconciliationStatusItem,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/sheets/bottom-sheet"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { Button, buttonVariants } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import {
  ChevronRightIcon,
  CircleAlertIcon,
  RefreshCwIcon,
  ScaleIcon,
  TriangleAlertIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type IrregularitiesSectionProps = {
  drifts: readonly FinanceBalanceDrift[]
  reconciliationItems: readonly FinanceReconciliationStatusItem[]
  display: FinanceMoneyDisplay
  /** Product detail where the movement history can be reviewed. */
  driftHref: (drift: FinanceBalanceDrift) => string | null
  /** Product detail with its reconciliation sheet already open. */
  reconciliationHref: (item: FinanceReconciliationStatusItem) => string | null
  onRecalculate: (drift: FinanceBalanceDrift) => void
  recalculatePending: boolean
  className?: string
}

const INDICATOR_CLASS =
  "inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"

function driftName(drift: FinanceBalanceDrift): string {
  return drift.name ?? (drift.accountId ? "Cuenta" : "Tarjeta")
}

function ReconciliationCard({
  item,
  display,
  href,
}: {
  item: FinanceReconciliationStatusItem
  display: FinanceMoneyDisplay
  href: string | null
}) {
  const content = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/15">
        <ScaleIcon className="size-5 text-warning" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.name}</span>
        <span className="block truncate text-xs text-muted-foreground tabular-nums">
          {reconciliationSubtitle(item, display)}
        </span>
      </span>
      {href ? (
        <ChevronRightIcon
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      ) : null}
    </>
  )
  const className =
    "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left"

  if (!href) {
    return <div className={className}>{content}</div>
  }

  return (
    <Link
      href={href}
      className={cn(className, PRESSABLE_CLASS)}
      aria-label={`Conciliar ${item.name}`}
    >
      {content}
    </Link>
  )
}

function DriftCard({
  drift,
  display,
  href,
  pending,
  onRecalculate,
}: {
  drift: FinanceBalanceDrift
  display: FinanceMoneyDisplay
  href: string | null
  pending: boolean
  onRecalculate: () => void
}) {
  const driftDisplay = { ...display, currency: drift.currency }
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <TriangleAlertIcon className="size-5 text-destructive" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{driftName(drift)}</p>
          <p className="text-xs text-muted-foreground">
            {drift.currency} · Diferencia{" "}
            <span className="font-semibold text-destructive tabular-nums">
              {formatFinanceMoney(drift.difference, driftDisplay)}
            </span>
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-muted/50 px-2 py-1.5">
          <dt className="text-muted-foreground">Guardado</dt>
          <dd className="font-semibold tabular-nums">
            {formatFinanceMoney(drift.storedBalance, driftDisplay)}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/50 px-2 py-1.5">
          <dt className="text-muted-foreground">Debería ser</dt>
          <dd className="font-semibold tabular-nums">
            {formatFinanceMoney(drift.expectedBalance, driftDisplay)}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={PRESSABLE_CLASS}
          disabled={pending}
          onClick={onRecalculate}
        >
          {pending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <RefreshCwIcon className="size-4 shrink-0" aria-hidden />
          )}
          Recalcular
        </Button>
        {href ? (
          <Link
            href={href}
            className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
          >
            <ChevronRightIcon className="size-4 shrink-0" aria-hidden />
            Revisar movimientos
          </Link>
        ) : null}
      </div>
    </div>
  )
}

/** The two irregularity indicators with their sheets and glossary help. */
export function IrregularitiesSection({
  drifts,
  reconciliationItems,
  display,
  driftHref,
  reconciliationHref,
  onRecalculate,
  recalculatePending,
  className,
}: IrregularitiesSectionProps) {
  const driftSheet = useSheetParam(FINANCE_SHEET_KEYS.balanceDrifts)
  const reconciliationSheet = useSheetParam(
    FINANCE_SHEET_KEYS.pendingReconciliations
  )
  const [confirmDrift, setConfirmDrift] = useState<FinanceBalanceDrift | null>(
    null
  )
  const pendingReconciliations = pendingReconciliationItems(reconciliationItems)

  if (drifts.length === 0 && pendingReconciliations.length === 0) {
    return null
  }

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {drifts.length > 0 ? (
          <div className={INDICATOR_CLASS}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                PRESSABLE_CLASS,
                "rounded-full text-destructive hover:text-destructive"
              )}
              onClick={() => driftSheet.setOpen(true)}
            >
              <CircleAlertIcon className="size-4" aria-hidden />
              Descuadres ({drifts.length})
            </Button>
            <GlossaryHelpButton slug="descuadre" label="Qué es un descuadre" />
          </div>
        ) : null}

        {pendingReconciliations.length > 0 ? (
          <div className={INDICATOR_CLASS}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                PRESSABLE_CLASS,
                "rounded-full text-warning hover:text-warning"
              )}
              onClick={() => reconciliationSheet.setOpen(true)}
            >
              <ScaleIcon className="size-4" aria-hidden />
              Sin conciliar ({pendingReconciliations.length})
            </Button>
            <GlossaryHelpButton
              slug="sin-conciliar"
              label="Qué significa sin conciliar"
            />
          </div>
        ) : null}
      </div>

      <BottomSheet
        open={driftSheet.open}
        onOpenChange={driftSheet.setOpen}
        title={`Descuadres (${drifts.length})`}
        description="El saldo guardado no coincide con la suma de los movimientos confirmados."
      >
        {drifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No queda ningún descuadre abierto.
          </p>
        ) : (
          drifts.map((drift) => (
            <DriftCard
              key={drift.id}
              drift={drift}
              display={display}
              href={driftHref(drift)}
              pending={recalculatePending}
              onRecalculate={() => setConfirmDrift(drift)}
            />
          ))
        )}
      </BottomSheet>

      <BottomSheet
        open={reconciliationSheet.open}
        onOpenChange={reconciliationSheet.setOpen}
        title={`Sin conciliar (${pendingReconciliations.length})`}
        description="Productos que todavía no cerraste contra el banco este mes."
      >
        {pendingReconciliations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todos los productos están conciliados este mes.
          </p>
        ) : (
          pendingReconciliations.map((item) => (
            <ReconciliationCard
              key={item.key}
              item={item}
              display={display}
              href={reconciliationHref(item)}
            />
          ))
        )}
      </BottomSheet>

      <ConfirmDialog
        open={confirmDrift !== null}
        onOpenChange={(open) => {
          if (!open && !recalculatePending) {
            setConfirmDrift(null)
          }
        }}
        icon={RefreshCwIcon}
        title="¿Recalcular el saldo?"
        description="El saldo guardado se corrige a la suma de los movimientos confirmados. No se crea ningún movimiento."
        confirmLabel="Recalcular"
        confirmIcon={RefreshCwIcon}
        pending={recalculatePending}
        pendingLabel="Recalculando..."
        onConfirm={() => {
          if (confirmDrift) {
            onRecalculate(confirmDrift)
            setConfirmDrift(null)
          }
        }}
      />
    </>
  )
}
