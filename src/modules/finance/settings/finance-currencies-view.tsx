"use client"

import { apiPost } from "@/src/config/api-client"
import { CurrencyFlag } from "@/src/modules/finance/shared/components/currency-flag"
import { CurrencyPickerSheet } from "@/src/modules/finance/shared/components/pickers/currency-picker-sheet"
import { FINANCE_SHEET_KEYS } from "@/src/modules/finance/shared/constants/sheet-keys"
import { useExchangeRates } from "@/src/modules/finance/shared/hooks/use-exchange-rates"
import { currencyDisplayName } from "@/src/modules/finance/shared/lib/currency-display-name"
import { normalizeTrackedCurrencies } from "@/src/modules/finance/shared/lib/finance-currency"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"
import { Button } from "@/src/shared/components/ui/button"
import { Card } from "@/src/shared/components/ui/card"
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
import { Spinner } from "@/src/shared/components/ui/spinner"
import { API_ENDPOINTS } from "@/src/shared/constants/api-endpoints"
import { appToast } from "@/src/shared/lib/app-toast"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

export function FinanceCurrenciesView() {
  const { config, updateConfig, updateMutation, formatLocale } =
    useUserModuleConfig("finance")
  const queryClient = useQueryClient()

  const changeBaseCurrencySheet = useSheetParam(
    FINANCE_SHEET_KEYS.changeBaseCurrency
  )
  const addCurrencySheet = useSheetParam(FINANCE_SHEET_KEYS.addCurrency)
  const [pendingBaseCurrency, setPendingBaseCurrency] = useState<string | null>(
    null
  )
  const [pendingRemoveCurrency, setPendingRemoveCurrency] = useState<
    string | null
  >(null)
  const [removalLabel, setRemovalLabel] = useState<string | null>(null)
  const currencyToRemove = pendingRemoveCurrency ?? removalLabel

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

  const handleConfirmRemove = async () => {
    if (!pendingRemoveCurrency) {
      return
    }
    await handleRemoveCurrency(pendingRemoveCurrency)
    setPendingRemoveCurrency(null)
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
      <section className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Moneda principal
        </h2>
        <Card className="gap-0 bg-card p-1">
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
              onClick={() => changeBaseCurrencySheet.setOpen(true)}
            >
              <PencilIcon className="size-4 shrink-0" />
              Cambiar
            </Button>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between gap-2 px-1">
          <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Otros
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Agregar moneda"
            disabled={isSaving}
            onClick={() => addCurrencySheet.setOpen(true)}
          >
            <PlusIcon className="size-4" />
            Agregar moneda
          </Button>
        </div>
        <Card className="gap-0 bg-card p-1">
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
                            locale: formatLocale,
                          })}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Quitar ${code}`}
                    disabled={isSaving}
                    onClick={() => {
                      setRemovalLabel(code)
                      setPendingRemoveCurrency(code)
                    }}
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
        </Card>
      </section>

      <CurrencyPickerSheet
        open={changeBaseCurrencySheet.open}
        onOpenChange={changeBaseCurrencySheet.setOpen}
        value={baseCurrency}
        enabled
        codes={trackedCurrencies}
        quotes={rateByCurrency}
        quoteCurrency={baseCurrency}
        onSelect={(code) => setPendingBaseCurrency(code)}
      />
      <CurrencyPickerSheet
        open={addCurrencySheet.open}
        onOpenChange={addCurrencySheet.setOpen}
        value=""
        enabled
        title="Agregar moneda"
        searchable
        showNames
        excludeCodes={[baseCurrency, ...trackedCurrencies]}
        onSelect={(code) => void handleAddCurrency(code)}
      />

      <AlertDialog
        open={pendingRemoveCurrency !== null}
        onOpenChange={(open) => {
          if (!open && !updateMutation.isPending) {
            setPendingRemoveCurrency(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2Icon aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>¿Quitar {currencyToRemove}?</AlertDialogTitle>
            <AlertDialogDescription>
              {currencyToRemove} dejará de mostrarse en Otros. Las transacciones
              en esa moneda no se borran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending}>
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={updateMutation.isPending}
              onClick={() => void handleConfirmRemove()}
            >
              {updateMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {updateMutation.isPending ? "Quitando..." : "Quitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingBaseCurrency !== null}
        onOpenChange={(open) => {
          if (!open && !changeBaseMutation.isPending) {
            setPendingBaseCurrency(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-muted text-muted-foreground">
              <RefreshCwIcon aria-hidden="true" />
            </AlertDialogMedia>
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
              <XIcon className="size-4 shrink-0" aria-hidden="true" />
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={changeBaseMutation.isPending}
              onClick={handleConfirmChange}
            >
              {changeBaseMutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCwIcon className="size-4 shrink-0" aria-hidden="true" />
              )}
              {changeBaseMutation.isPending ? "Cambiando..." : "Cambiar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
