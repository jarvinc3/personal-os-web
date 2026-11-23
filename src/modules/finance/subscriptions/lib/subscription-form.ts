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
  categoryId: z.string(),
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

function basicsFromSubscription(
  subscription: FinanceSubscription,
  draft: SubscriptionDraft | undefined
): Pick<
  SubscriptionFormValues,
  "name" | "amount" | "currency" | "sourcePatternId"
> {
  return {
    name: subscription.name,
    amount: subscription.amount,
    currency: subscription.currency,
    sourcePatternId:
      subscription.sourcePatternId ?? draft?.sourcePatternId ?? "",
  }
}

function basicsFromDraft(
  draft: SubscriptionDraft | undefined,
  defaultCurrency: string
): Pick<
  SubscriptionFormValues,
  "name" | "amount" | "currency" | "sourcePatternId"
> {
  return {
    name: draft?.name ?? "",
    amount: draft?.amount ?? "",
    currency: draft?.currency ?? defaultCurrency,
    sourcePatternId: draft?.sourcePatternId ?? "",
  }
}

function subscriptionBasics(
  subscription: FinanceSubscription | null,
  draft: SubscriptionDraft | undefined,
  defaultCurrency: string
): Pick<
  SubscriptionFormValues,
  "name" | "amount" | "currency" | "sourcePatternId"
> {
  if (subscription) {
    return basicsFromSubscription(subscription, draft)
  }
  return basicsFromDraft(draft, defaultCurrency)
}

function subscriptionDates(
  subscription: FinanceSubscription | null
): Pick<SubscriptionFormValues, "anchorDate" | "trialEndsAt"> {
  return {
    anchorDate: subscription
      ? toDateInput(subscription.anchorDate)
      : todayInput(),
    trialEndsAt: toDateInput(subscription?.trialEndsAt),
  }
}

function subscriptionLinks(
  subscription: FinanceSubscription | null
): Pick<SubscriptionFormValues, "cardId" | "accountId" | "categoryId"> {
  return {
    cardId: subscription?.cardId ?? CATALOG_NONE,
    accountId: subscription?.accountId ?? CATALOG_NONE,
    categoryId: subscription?.categoryId ?? CATALOG_NONE,
  }
}

export function toSubscriptionFormValues(
  subscription: FinanceSubscription | null,
  options: {
    defaultCurrency: string
    draft?: SubscriptionDraft
  }
): SubscriptionFormValues {
  return {
    ...subscriptionBasics(subscription, options.draft, options.defaultCurrency),
    domain: subscription?.domain ?? "",
    billingCycle: subscription?.billingCycle ?? "MONTHLY",
    billingInterval: String(subscription?.billingInterval ?? 1),
    ...subscriptionDates(subscription),
    ...subscriptionLinks(subscription),
    manageUrl: subscription?.manageUrl ?? "",
    notes: subscription?.notes ?? "",
  }
}

/** Payments only move a balance when the subscription has a card or an account. */
export function hasPaymentMethodTarget(values: {
  cardId: string
  accountId: string
}): boolean {
  return values.cardId !== CATALOG_NONE || values.accountId !== CATALOG_NONE
}

export function subscriptionPayload(
  values: SubscriptionFormValues
): Record<string, unknown> {
  // Clearable fields go as null so PATCH can empty them; undefined would mean
  // "leave unchanged" on the server.
  return {
    name: values.name.trim(),
    domain: values.domain.trim() || null,
    amount: Number(values.amount.replace(",", ".")),
    currency: values.currency.toUpperCase(),
    billingCycle: values.billingCycle,
    billingInterval: Number(values.billingInterval),
    anchorDate: values.anchorDate,
    trialEndsAt: values.trialEndsAt || null,
    cardId: values.cardId === CATALOG_NONE ? null : values.cardId,
    accountId: values.accountId === CATALOG_NONE ? null : values.accountId,
    categoryId: values.categoryId === CATALOG_NONE ? null : values.categoryId,
    manageUrl: values.manageUrl.trim() || null,
    notes: values.notes.trim() || null,
    sourcePatternId: values.sourcePatternId || null,
  }
}
