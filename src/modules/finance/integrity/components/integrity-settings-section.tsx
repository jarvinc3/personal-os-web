"use client"

import { RefreshCwIcon } from "lucide-react"

import {
  useFinanceIntegrity,
  useRecalculateBalance,
} from "@/src/modules/finance/shared/hooks/use-integrity"
import { recalculationPayload } from "@/src/modules/finance/shared/lib/integrity"
import { financeErrorMessage } from "@/src/modules/finance/shared/lib/finance-error"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { BalanceIntegrityAlert } from "@/src/modules/finance/integrity/components/balance-integrity-alert"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { SummarySection } from "@/src/shared/components/ui/summary"
import { appToast } from "@/src/shared/lib/app-toast"

type FinanceIntegritySettingsSectionProps = {
  enabled: boolean
  display: FinanceMoneyDisplay
}

/** Runs the manual integrity check from the finance settings screen. */
export function FinanceIntegritySettingsSection({
  enabled,
  display,
}: FinanceIntegritySettingsSectionProps) {
  const integrityQuery = useFinanceIntegrity(enabled)
  const recalculate = useRecalculateBalance()
  const drifts = integrityQuery.data?.drifts ?? []

  async function runCheck() {
    try {
      const checked = await integrityQuery.refetch()
      const count = checked.data?.drifts.length ?? 0
      appToast.success({
        text1: "Verificación completada",
        text2:
          count === 0
            ? "Todos los saldos coinciden con sus movimientos."
            : `${count} saldo${count === 1 ? "" : "s"} descuadrado${count === 1 ? "" : "s"}.`,
      })
    } catch (error) {
      appToast.error({ text1: financeErrorMessage(error) })
    }
  }

  return (
    <SummarySection title="Integridad de saldos" icon={RefreshCwIcon}>
      <div className="flex flex-col gap-3 p-3">
        <p className="text-sm text-muted-foreground">
          Compara el saldo guardado de cada cuenta y tarjeta con la suma de sus
          movimientos confirmados.
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full"
          disabled={integrityQuery.isFetching}
          onClick={() => void runCheck()}
        >
          {integrityQuery.isFetching ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <RefreshCwIcon className="size-4 shrink-0" />
          )}
          Verificar ahora
        </Button>
        {integrityQuery.isError ? (
          <p className="text-sm text-destructive">
            {financeErrorMessage(integrityQuery.error)}
          </p>
        ) : null}
        <BalanceIntegrityAlert
          drifts={drifts}
          display={display}
          pending={recalculate.isPending}
          onRecalculate={(drift) => {
            recalculate.mutate(recalculationPayload(drift), {
              onSuccess: () => appToast.success({ text1: "Saldo corregido" }),
              onError: (error) =>
                appToast.error({ text1: financeErrorMessage(error) }),
            })
          }}
        />
      </div>
    </SummarySection>
  )
}
