import { z } from "zod"

import { CATALOG_NONE } from "@/src/modules/finance/shared/constants/catalog"
import { FINANCE_INSTALLMENT_FREQS } from "@/src/modules/finance/shared/types/entities"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"

export const loanSchema = z
  .object({
    name: z.string().max(120),
    lenderName: z.string().trim().min(1, "Prestamista obligatorio").max(120),
    institutionId: z.string(),
    accountId: z.string(),
    originalAmount: z.string().trim().min(1, "Monto original obligatorio"),
    currentBalance: z.string().trim().min(1, "Saldo obligatorio"),
    installmentAmount: z.string().trim().min(1, "Cuota obligatoria"),
    installmentFreq: z.enum(FINANCE_INSTALLMENT_FREQS),
    totalInstallments: z.string().trim().min(1, "Cuotas totales obligatorias"),
    paidInstallments: z.string(),
    nextDueDate: z.string().trim().min(1, "Próximo vencimiento obligatorio"),
    interestRatePercent: z.string(),
    notes: z.string().max(500),
    currency: z.string().trim().min(3).max(3),
  })
  .superRefine((values, ctx) => {
    const originalAmount = parseFinanceMoney(values.originalAmount)
    const currentBalance = parseFinanceMoney(values.currentBalance)
    if (
      originalAmount !== null &&
      currentBalance !== null &&
      currentBalance > originalAmount
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["currentBalance"],
        message: "El saldo no puede superar el monto original",
      })
    }

    const installmentAmount = parseFinanceMoney(values.installmentAmount)
    if (installmentAmount !== null && installmentAmount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["installmentAmount"],
        message: "La cuota debe ser mayor que cero",
      })
    }

    const totalInstallments =
      values.totalInstallments.trim() === ""
        ? null
        : Number(values.totalInstallments)
    const paidInstallments =
      values.paidInstallments.trim() === ""
        ? 0
        : Number(values.paidInstallments)
    if (
      totalInstallments !== null &&
      Number.isFinite(totalInstallments) &&
      Number.isFinite(paidInstallments) &&
      paidInstallments > totalInstallments
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["paidInstallments"],
        message: "Las cuotas pagadas no pueden superar el total",
      })
    }
  })

export type LoanFormValues = z.infer<typeof loanSchema>

export const LOAN_WIZARD_TERMS = [12, 24, 36, 48, 60] as const

export const loanWizardSchema = z
  .object({
    who: z.enum(["BANK", "PERSON"]),
    name: z.string().max(120),
    lenderName: z.string().max(120),
    institutionId: z.string(),
    amount: z.string().trim().min(1, "Monto obligatorio"),
    currency: z.string().trim().min(3).max(3),
    freq: z.enum(FINANCE_INSTALLMENT_FREQS),
    periods: z.string().trim().min(1, "Plazo obligatorio"),
    known: z.enum(["RATE", "INSTALLMENT"]),
    ratePercent: z.string(),
    installment: z.string(),
    accountId: z.string(),
    disbursementAccountId: z.string(),
    disbursementDate: z.string().trim().min(1, "Fecha obligatoria"),
    rateType: z.enum(["FIXED", "VARIABLE"]),
    insuranceAmount: z.string(),
    notes: z.string().max(500),
  })
  .superRefine((values, ctx) => {
    if (values.who === "BANK" && values.institutionId === CATALOG_NONE) {
      ctx.addIssue({
        code: "custom",
        path: ["institutionId"],
        message: "Elige la institución",
      })
    }
    if (values.who === "PERSON" && values.lenderName.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["lenderName"],
        message: "Prestamista obligatorio",
      })
    }
    const amount = parseFinanceMoney(values.amount)
    if (amount !== null && amount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "El monto debe ser mayor que cero",
      })
    }
    const periods = Number(values.periods)
    if (!Number.isInteger(periods) || periods < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["periods"],
        message: "El plazo debe ser al menos 1",
      })
    }
    if (values.known === "INSTALLMENT") {
      const installment = parseFinanceMoney(values.installment)
      if (installment !== null && installment <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["installment"],
          message: "La cuota debe ser mayor que cero",
        })
      }
    } else {
      const percent =
        values.ratePercent.trim() === "" ? 0 : Number(values.ratePercent)
      if (!Number.isFinite(percent) || percent < 0) {
        ctx.addIssue({
          code: "custom",
          path: ["ratePercent"],
          message: "La tasa no es válida",
        })
      }
    }
  })

export type LoanWizardValues = z.infer<typeof loanWizardSchema>

/**
 * Reads the wizard fields an AI reply or a shared link can carry in the URL.
 * Unknown or empty values are left out so the wizard keeps its own defaults.
 */
export function loanWizardPrefill(params: {
  get(name: string): string | null
}): Partial<LoanWizardValues> {
  const prefill: Partial<LoanWizardValues> = {}

  const amount = params.get("amount")?.trim()
  if (amount) {
    prefill.amount = amount
  }
  const periods = params.get("periods")?.trim()
  if (periods) {
    prefill.periods = periods
  }
  const ratePercent = params.get("ratePercent")?.trim()
  if (ratePercent) {
    prefill.ratePercent = ratePercent
    prefill.known = "RATE"
  }
  const installment = params.get("installment")?.trim()
  if (installment) {
    prefill.installment = installment
    prefill.known = "INSTALLMENT"
  }
  const lenderName = params.get("lenderName")?.trim()
  if (lenderName) {
    prefill.lenderName = lenderName
    prefill.who = "PERSON"
  }
  const freq = params.get("freq")
  if (freq && (FINANCE_INSTALLMENT_FREQS as readonly string[]).includes(freq)) {
    prefill.freq = freq as LoanWizardValues["freq"]
  }
  const who = params.get("who")
  if (who === "BANK" || who === "PERSON") {
    prefill.who = who
  }

  return prefill
}
