"use client"

import { useUserModuleConfig } from "@/src/modules/settings/hooks/use-user-module-config"

export type FinanceAmountEntryMode = "keyboard" | "calculator"

/**
 * Los formularios de Finanzas abren el monto con el modo que el usuario eligió
 * la última vez. Vive en la config del módulo para viajar con el módulo.
 */
export function useFinanceAmountEntry() {
  const { config, updateConfig } = useUserModuleConfig("finance")

  const setAmountEntry = (next: FinanceAmountEntryMode) => {
    void updateConfig({ amountEntry: next })
  }

  return { amountEntry: config.amountEntry, setAmountEntry }
}
