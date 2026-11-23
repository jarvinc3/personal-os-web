"use client"

import { RefreshCwIcon, TriangleAlertIcon, XIcon } from "lucide-react"
import { useState } from "react"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { openDriftFrom } from "@/src/modules/finance/shared/lib/integrity"
import type { FinanceBalanceDrift } from "@/src/modules/finance/shared/types/entities"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"

type BalanceIntegrityAlertProps = {
  drifts: readonly FinanceBalanceDrift[]
  display: FinanceMoneyDisplay
  onRecalculate: (drift: FinanceBalanceDrift) => void
  title?: string
  pending?: boolean
  className?: string
}

/** Warns about open balance deviations and offers to recompute the balance. */
export function BalanceIntegrityAlert({
  drifts,
  display,
  onRecalculate,
  title = "Saldo descuadrado",
  pending = false,
  className,
}: BalanceIntegrityAlertProps) {
  const [confirmTarget, setConfirmTarget] =
    useState<FinanceBalanceDrift | null>(null)
  const activeTarget = openDriftFrom(drifts, confirmTarget)

  if (drifts.length === 0) {
    return null
  }

  return (
    <>
      <div className={cn("flex flex-col gap-2", className)}>
        {drifts.map((drift) => {
          const driftDisplay = { ...display, currency: drift.currency }
          return (
            <Alert key={drift.id} variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>
                {drift.name ? `${title}: ${drift.name}` : title}
              </AlertTitle>
              <AlertDescription>
                Guardado {formatFinanceMoney(drift.storedBalance, driftDisplay)}{" "}
                · Debería ser{" "}
                {formatFinanceMoney(drift.expectedBalance, driftDisplay)} ·
                Diferencia {formatFinanceMoney(drift.difference, driftDisplay)}
              </AlertDescription>
              <AlertAction>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={PRESSABLE_CLASS}
                  disabled={pending}
                  onClick={() => setConfirmTarget(drift)}
                >
                  <RefreshCwIcon className="size-4 shrink-0" />
                  Recalcular
                </Button>
              </AlertAction>
            </Alert>
          )
        })}
      </div>

      <AlertDialog
        open={activeTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !pending) {
            setConfirmTarget(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <RefreshCwIcon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Recalcular el saldo?</AlertDialogTitle>
            <AlertDialogDescription>
              El saldo guardado se corrige a la suma de los movimientos
              confirmados. No se crea ningún movimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => {
                if (activeTarget) {
                  onRecalculate(activeTarget)
                }
              }}
            >
              {pending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {pending ? "Recalculando..." : "Recalcular"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
