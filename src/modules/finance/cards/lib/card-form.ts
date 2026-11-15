import { z } from "zod"

import {
  CATALOG_NONE,
  FINANCE_CARD_TYPES,
} from "@/src/modules/finance/shared/constants/catalog"
import type { CardBalanceInput } from "@/src/modules/finance/shared/lib/catalog-payloads"
import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities"

function isOptionalMoneyInput(value: string): boolean {
  return value.trim() === "" || parseFinanceMoney(value) !== null
}

const balanceRowSchema = z.object({
  currency: z.string().trim().min(3, "Moneda obligatoria").max(3),
  balance: z.string().trim().refine(isOptionalMoneyInput, "Saldo inválido"),
  creditLimit: z
    .string()
    .trim()
    .refine(isOptionalMoneyInput, "Límite inválido"),
})

export const cardSchema = z
  .object({
    name: z.string().trim().min(1, "Nombre obligatorio").max(120),
    type: z.enum(FINANCE_CARD_TYPES),
    institutionId: z.string().min(1, "Institución obligatoria"),
    accountId: z.string(),
    network: z.string(),
    lastFour: z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Deben ser 4 dígitos"),
    statementClosingDay: z.string().trim(),
    paymentDueDay: z.string().trim(),
    color: z.string().trim().max(20),
    balances: z.array(balanceRowSchema),
  })
  .superRefine((values, ctx) => {
    if (
      values.type === "DEBIT" &&
      (!values.accountId || values.accountId === CATALOG_NONE)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["accountId"],
        message: "La tarjeta de débito necesita una cuenta",
      })
    }
    if (values.type !== "CREDIT") {
      return
    }
    values.balances.forEach((row, index) => {
      const hasValue =
        row.balance.trim() !== "" || row.creditLimit.trim() !== ""
      if (hasValue && row.creditLimit.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "Límite de crédito obligatorio",
          path: ["balances", index, "creditLimit"],
        })
      }
    })
  })

export type CardFormValues = z.infer<typeof cardSchema>

/**
 * The form asks for debt at the closing date; the API stores the available
 * credit of each currency. An empty balance means no debt.
 */
export function cardCreateBalanceRows(
  values: CardFormValues
): CardBalanceInput[] {
  if (values.type !== "CREDIT") {
    return values.balances
  }

  return values.balances.map((row) => {
    const creditLimit = parseFinanceMoney(row.creditLimit)
    if (creditLimit === null) {
      return row
    }
    const debt = parseFinanceMoney(row.balance) ?? 0
    return { ...row, balance: String(creditLimit - debt) }
  })
}

/**
 * Accounts a card can point at: the active ones of the chosen institution.
 * A DEBIT card is paid from its own institution, so the selector never offers
 * accounts from another bank.
 */
export function institutionAccountOptions(
  accounts: readonly FinanceAccount[],
  institutionId: string
): FinanceAccount[] {
  return accounts.filter(
    (account) => account.isActive && account.institutionId === institutionId
  )
}
