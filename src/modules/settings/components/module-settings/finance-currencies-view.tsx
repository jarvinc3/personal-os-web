"use client"

import { apiPost } from "@/src/config/api-client"
import { CurrencyFlag } from "@/src/modules/finance/components/currency-flag"
import { CurrencyPickerSheet } from "@/src/modules/finance/components/transactions/currency-picker-sheet"
import { useExchangeRates } from "@/src/modules/finance/hooks/use-exchange-rates"
import { currencyDisplayName } from "@/src/modules/finance/lib/currency-display-name"
import { normalizeTrackedCurrencies } from "@/src/modules/finance/lib/finance-currency"
import { formatFinanceMoney } from "@/src/modules/finance/lib/money"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { SettingsSection } from "@/src/shared/components/layout/settings-section"
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
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { useMemo, useState } from "react"

export function FinanceCurrenciesView() {
  const { config, updateConfig, updateMutation } =
    useUserModuleConfig("finance")
  const queryClient = useQueryClient()

  const [changePickerOpen, setChangePickerOpen] = useState(false)
  const [addPickerOpen, setAddPickerOpen] = useState(false)
  const [pendingBaseCurrency, setPendingBaseCurrency] = useState<string | null>(
    null
  )

  const baseCurrency = config.baseCurrency
  const trackedCurrencies = useMemo(
    () => normalizeTrackedCurrencies(baseCurrency, config.trackedCurrencies),
    [baseCurrency, config.trackedCurrencies]
  )

  const ratesQuery = useExchangeRates(baseCurrency, trackedCurrencies)
  const rateByCurrency = useMemo(() => {
    const rates = new Map<string, string | null>()
    for (const quote of ratesQuery.data?.rates ?? []) {
      rates.set(quote.currency, quote.rate)
    }
    return rates
  }, [ratesQuery.data])

  const changeBaseMutation = useMutation({
    mutationFn: async (nextBaseCurrency: string) => {
      await apiPost(API_ENDPOINTS.FINANCE.BASE_CURRENCY, {
        baseCurrency: nextBaseCurrency,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries()
      appToast.success({
        text1: "Moneda principal actualizada",
        text2: "Los importes en moneda base se recalcularon.",
      })
    },
    onError: (error) => {
      appToast.error({
        text1: "No se pudo cambiar la moneda",
        text2: error.message,
      })
    },
  })

  const handleAddCurrency = async (code: string) => {
    if (trackedCurrencies.includes(code)) {
      return
    }
    await updateConfig({
      trackedCurrencies: [...trackedCurrencies, code],
    })
    appToast.success({
      text1: "Moneda agregada",
      text2: `${code} ya está en la lista.`,
    })
  }

  const handleRemoveCurrency = async (code: string) => {
    await updateConfig({
      trackedCurrencies: trackedCurrencies.filter((item) => item !== code),
    })
  }

  const handleConfirmChange = () => {
    if (!pendingBaseCurrency) {
      return
    }
    changeBaseMutation.mutate(pendingBaseCurrency, {
      onSettled: () => setPendingBaseCurrency(null),
    })
  }

  const isSaving = updateMutation.isPending || changeBaseMutation.isPending

  return (
    <>
      <SettingsSection title="Moneda principal">
        <div className="flex items-center gap-3 border-b border-border/60 p-3">
          <CurrencyFlag code={baseCurrency} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium">{baseCurrency}</span>
            <span className="truncate text-xs text-muted-foreground">
              {currencyDisplayName(baseCurrency)}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Cambiar moneda principal"
            disabled={isSaving}
            onClick={() => setChangePickerOpen(true)}
          >
            Cambiar
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Otros"
        headerTrailing={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Agregar moneda"
            disabled={isSaving}
            onClick={() => setAddPickerOpen(true)}
          >
            <PlusIcon className="size-4" />
            Agregar moneda
          </Button>
        }
      >
        {trackedCurrencies.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">
            No hay otras monedas.
          </p>
        ) : (
          trackedCurrencies.map((code, index) => {
            const rate = rateByCurrency.get(code)
            return (
              <div
                key={code}
                className={
                  index === trackedCurrencies.length - 1
                    ? "flex items-center gap-3 p-3"
                    : "flex items-center gap-3 border-b border-border/60 p-3"
                }
              >
                <CurrencyFlag code={code} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm">{`${code} - ${currencyDisplayName(code)}`}</span>
                  <span className="text-xs text-muted-foreground">
                    {rate == null
                      ? "—"
                      : formatFinanceMoney(Number(rate), {
                          currency: baseCurrency,
                          showCents: true,
                          compactNumbers: false,
                        })}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Quitar ${code}`}
                  disabled={isSaving}
                  onClick={() => void handleRemoveCurrency(code)}
                >
                  <Trash2Icon className="size-4 text-destructive" />
                </Button>
              </div>
            )
          })
        )}
        {ratesQuery.isFetching && trackedCurrencies.length > 0 ? (
          <div className="flex justify-center py-2">
            <Spinner className="size-4" />
          </div>
        ) : null}
      </SettingsSection>

      <CurrencyPickerSheet
        open={changePickerOpen}
        onOpenChange={setChangePickerOpen}
        value={baseCurrency}
        enabled
        excludeCodes={[baseCurrency]}
        onSelect={(code) => setPendingBaseCurrency(code)}
      />
      <CurrencyPickerSheet
        open={addPickerOpen}
        onOpenChange={setAddPickerOpen}
        value=""
        enabled
        excludeCodes={[baseCurrency, ...trackedCurrencies]}
        onSelect={(code) => void handleAddCurrency(code)}
      />

      <AlertDialog
        open={pendingBaseCurrency !== null}
        onOpenChange={(open) => !open && setPendingBaseCurrency(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Cambiar la moneda principal a {pendingBaseCurrency}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Los importes en moneda base de tus transacciones y presupuestos se
              recalcularán con las tasas de cada fecha. Si falta una tasa, no se
              cambia nada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={changeBaseMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={changeBaseMutation.isPending}
              onClick={handleConfirmChange}
            >
              {changeBaseMutation.isPending ? "Cambiando..." : "Cambiar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
