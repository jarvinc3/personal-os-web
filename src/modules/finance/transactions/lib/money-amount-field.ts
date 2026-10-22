import { z } from "zod"

import {
  hasMoneyCentsInput,
  isMoneyAmountInput,
  isPositiveAmountInput,
  isWithinMaxAmountInput,
} from "@/src/modules/finance/shared/lib/ledger-form"

const CENTS_MESSAGE = "Monto con dos decimales como máximo"
const MAX_AMOUNT_MESSAGE = "El monto supera el máximo permitido"

/** Money field the ledger forms share: cents only, above zero, below the ceiling. */
export function moneyAmountField() {
  return z
    .string()
    .trim()
    .min(1, "Monto obligatorio")
    .refine(hasMoneyCentsInput, CENTS_MESSAGE)
    .refine(isPositiveAmountInput, "Monto mayor que cero")
    .refine(isWithinMaxAmountInput, MAX_AMOUNT_MESSAGE)
}

/** Optional money field: an empty value skips the amount rules. */
export function optionalMoneyAmountField(message: string) {
  return z
    .string()
    .trim()
    .refine((value) => value === "" || isMoneyAmountInput(value), message)
}
