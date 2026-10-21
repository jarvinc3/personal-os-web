import type { ModuleSettingsState } from "@/src/modules/settings/lib/module-settings-state"

export type ModuleActivationLabel =
  "Sin configurar" | "Activo" | "Desactivado" | "Pendiente de guardar"

type ModuleActivationLabelInput = {
  state: ModuleSettingsState
  savedIsEnabled: boolean
  pendingEnabled: boolean | null
}

/**
 * What the Apps list says about a module. A switch changed inside the settings
 * panel is pending until the user saves, so it never reads "Activo" early.
 */
export function moduleActivationLabel({
  state,
  savedIsEnabled,
  pendingEnabled,
}: ModuleActivationLabelInput): ModuleActivationLabel {
  if (state === "unconfigured") {
    return "Sin configurar"
  }
  const effectiveEnabled = pendingEnabled ?? savedIsEnabled
  if (effectiveEnabled === savedIsEnabled) {
    return savedIsEnabled ? "Activo" : "Desactivado"
  }
  return "Pendiente de guardar"
}

/** Pending value to share, or null when the switch is back on the saved value. */
export function pendingActivation(
  savedIsEnabled: boolean,
  nextEnabled: boolean
): boolean | null {
  return nextEnabled === savedIsEnabled ? null : nextEnabled
}
