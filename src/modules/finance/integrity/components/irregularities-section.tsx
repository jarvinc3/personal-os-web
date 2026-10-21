"use client"

import { GlossaryHelpButton } from "@/src/modules/help"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceBalanceDrift,
  FinanceReconciliationStatusItem,
} from "@/src/modules/finance/shared/types/entities"
import { BottomSheet } from "@/src/shared/components/layout/bottom-sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Button } from "@/src/shared/components/ui/button"
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
        <span className="block truncate text-xs text-muted-foreground">
          {item.institutionName ?? "Sin institución"} · {item.currency} ·{" "}
          {formatFinanceMoney(item.balance, {
            ...display,
            currency: item.currency,
          })}
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
          <Button asChild size="sm" variant="ghost">
            <Link href={href}>
              <ChevronRightIcon className="size-4 shrink-0" aria-hidden />
              Revisar movimientos
            </Link>
          </Button>
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
  const [openSheet, setOpenSheet] = useState<"drift" | "reconciliation" | null>(
    null
  )
  const [confirmDrift, setConfirmDrift] = useState<FinanceBalanceDrift | null>(
    null
  )
  const pendingReconciliations = reconciliationItems.filter(
    (item) => !item.reconciled
  )

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
              onClick={() => setOpenSheet("drift")}
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
              onClick={() => setOpenSheet("reconciliation")}
            >
              <ScaleIcon className="size-4" aria-hidden />
              Sin conciliar ({pendingReconciliations.length})
            </Button>
            <GlossaryHelpButton
              slug="conciliar"
              label="Qué significa conciliar"
            />
          </div>
        ) : null}
      </div>

      <BottomSheet
        open={openSheet === "drift"}
        onOpenChange={(open) => {
          if (!open) {
            setOpenSheet(null)
          }
        }}
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
        open={openSheet === "reconciliation"}
        onOpenChange={(open) => {
          if (!open) {
            setOpenSheet(null)
          }
        }}
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

      <AlertDialog
        open={confirmDrift !== null}
        onOpenChange={(open) => {
          if (!open && !recalculatePending) {
            setConfirmDrift(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Recalcular el saldo?</AlertDialogTitle>
            <AlertDialogDescription>
              El saldo guardado se corrige a la suma de los movimientos
              confirmados. No se crea ningún movimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={recalculatePending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={recalculatePending}
              onClick={() => {
                if (confirmDrift) {
                  onRecalculate(confirmDrift)
                  setConfirmDrift(null)
                }
              }}
            >
              {recalculatePending ? <Spinner data-icon="inline-start" /> : null}
              Recalcular
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
