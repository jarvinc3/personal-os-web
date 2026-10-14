import type {
  FinanceRecurringFrequency,
  FinanceRecurringKind,
  FinanceRecurringStatus,
} from "@/src/modules/finance/shared/types/entities"

export const RECURRING_FREQUENCY_LABEL: Record<
  FinanceRecurringFrequency,
  string
> = {
  7: "Semanal",
  14: "Quincenal",
  30: "Mensual",
  365: "Anual",
}

export const RECURRING_STATUS_LABEL: Record<FinanceRecurringStatus, string> = {
  SUGGESTED: "Por confirmar",
  CONFIRMED: "Confirmado",
  DISMISSED: "Descartado",
}

export const RECURRING_KIND_LABEL: Record<FinanceRecurringKind, string> = {
  SUBSCRIPTION: "Suscripción",
  BILL: "Servicio",
  INCOME: "Ingreso",
  OTHER: "Otro",
}

export function recurringFrequencyLabel(
  frequency: FinanceRecurringFrequency
): string {
  return RECURRING_FREQUENCY_LABEL[frequency] ?? "Cada 30 días"
}

/** Short countdown copy for the next expected charge. */
export function nextChargeLabel(daysUntil: number): string {
  if (daysUntil < 0) {
    const late = Math.abs(daysUntil)
    return late === 1 ? "Hace 1 día" : `Hace ${late} días`
  }
  if (daysUntil === 0) {
    return "Hoy"
  }
  if (daysUntil === 1) {
    return "Mañana"
  }
  return `En ${daysUntil} días`
}
