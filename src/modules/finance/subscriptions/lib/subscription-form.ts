import { z } from "zod"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import type {
  FinanceBillingCycle,
  FinanceSubscription,
} from "@/src/modules/finance/shared/types/entities"

export const BILLING_CYCLE_OPTIONS: {
  value: FinanceBillingCycle
  label: string
}[] = [
  { value: "WEEKLY", label: "Semanal" },
  { value: "MONTHLY", label: "Mensual" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "SEMIANNUAL", label: "Semestral" },
  { value: "YEARLY", label: "Anual" },
]

const BILLING_CYCLES = [
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "SEMIANNUAL",
  "YEARLY",
] as const

function positiveAmount(value: string): boolean {
  return Number(value.replace(",", ".")) > 0
}

function integerInRange(value: string, min: number, max: number): boolean {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= min && parsed <= max
}

export const subscriptionFormSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(160),
  domain: z.string().trim().max(160),
  amount: z.string().trim().refine(positiveAmount, {
    message: "Monto mayor que cero",
  }),
  currency: z.string().trim().length(3, "Moneda de 3 letras"),
  billingCycle: z.enum(BILLING_CYCLES),
  billingInterval: z
    .string()
    .trim()
    .refine((value) => integerInRange(value, 1, 60), {
      message: "Intervalo entre 1 y 60",
    }),
  anchorDate: z.string().min(1, "Primer cobro obligatorio"),
  trialEndsAt: z.string(),
  cardId: z.string(),
  accountId: z.string(),
  reminderDaysBefore: z
    .string()
    .trim()
    .refine((value) => integerInRange(value, 0, 30), {
      message: "Días de recordatorio entre 0 y 30",
    }),
  manageUrl: z.string().trim().max(500),
  notes: z.string().trim().max(2000),
  sourcePatternId: z.string(),
})

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>

function toDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : ""
}

function todayInput(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Prefill for a subscription born from a detected recurring charge. */
export type SubscriptionDraft = {
  name: string
  amount: string
  currency: string
  sourcePatternId: string
}

export function toSubscriptionFormValues(
  subscription: FinanceSubscription | null,
  options: {
    defaultCurrency: string
    defaultReminderDays: number
    draft?: SubscriptionDraft | null
  }
): SubscriptionFormValues {
  const draft = options.draft ?? null
  return {
    name: subscription?.name ?? draft?.name ?? "",
    domain: subscription?.domain ?? "",
    amount: subscription?.amount ?? draft?.amount ?? "",
    currency:
      subscription?.currency ?? draft?.currency ?? options.defaultCurrency,
    billingCycle: subscription?.billingCycle ?? "MONTHLY",
    billingInterval: String(subscription?.billingInterval ?? 1),
    anchorDate: subscription
      ? toDateInput(subscription.anchorDate)
      : todayInput(),
    trialEndsAt: toDateInput(subscription?.trialEndsAt),
    cardId: subscription?.cardId ?? CATALOG_NONE,
    accountId: subscription?.accountId ?? CATALOG_NONE,
    reminderDaysBefore: String(
      subscription?.reminderDaysBefore ?? options.defaultReminderDays
    ),
    manageUrl: subscription?.manageUrl ?? "",
    notes: subscription?.notes ?? "",
    sourcePatternId:
      subscription?.sourcePatternId ?? draft?.sourcePatternId ?? "",
  }
}

export function subscriptionPayload(
  values: SubscriptionFormValues
): Record<string, unknown> {
  return {
    name: values.name.trim(),
    domain: values.domain.trim() || undefined,
    amount: Number(values.amount.replace(",", ".")),
    currency: values.currency.toUpperCase(),
    billingCycle: values.billingCycle,
    billingInterval: Number(values.billingInterval),
    anchorDate: values.anchorDate,
    trialEndsAt: values.trialEndsAt || undefined,
    cardId: values.cardId === CATALOG_NONE ? undefined : values.cardId,
    accountId: values.accountId === CATALOG_NONE ? undefined : values.accountId,
    reminderDaysBefore: Number(values.reminderDaysBefore),
    manageUrl: values.manageUrl.trim() || undefined,
    notes: values.notes.trim() || undefined,
    sourcePatternId: values.sourcePatternId || undefined,
  }
}
