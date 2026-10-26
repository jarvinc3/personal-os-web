export type TransactionPrefill = {
  amount: string
  currency: string
  categoryId: string
  transactionDate: string
  merchant: string
  description: string
}

export const EMPTY_TRANSACTION_PREFILL: TransactionPrefill = {
  amount: "",
  currency: "",
  categoryId: "",
  transactionDate: "",
  merchant: "",
  description: "",
}

function readParam(params: URLSearchParams, key: string): string {
  return params.get(key)?.trim() ?? ""
}

const PREFILL_QUERY_KEYS = {
  amount: "amount",
  currency: "currency",
  categoryId: "categoryId",
  transactionDate: "date",
  merchant: "merchant",
  description: "description",
} as const

export function parseTransactionPrefill(
  params: URLSearchParams
): TransactionPrefill {
  return {
    amount: readParam(params, PREFILL_QUERY_KEYS.amount),
    currency: readParam(params, PREFILL_QUERY_KEYS.currency).toUpperCase(),
    categoryId: readParam(params, PREFILL_QUERY_KEYS.categoryId),
    transactionDate: readParam(params, PREFILL_QUERY_KEYS.transactionDate),
    merchant: readParam(params, PREFILL_QUERY_KEYS.merchant),
    description: readParam(params, PREFILL_QUERY_KEYS.description),
  }
}

const PREFILL_QUERY_ORDER = Object.values(PREFILL_QUERY_KEYS)

/**
 * Query canónica del prefill, en orden fijo. Deja fuera `picker`, `sheet` y
 * `sheetId`: abrir o cerrar una hoja no es un prefill nuevo y no debe reiniciar
 * el formulario que la contiene.
 */
export function readTransactionPrefillQuery(params: URLSearchParams): string {
  const prefillParams = new URLSearchParams()
  for (const key of PREFILL_QUERY_ORDER) {
    const value = params.get(key)
    if (value !== null) {
      prefillParams.set(key, value)
    }
  }
  return prefillParams.toString()
}

export type TransactionFormParamsInput = {
  type: string
  destination?: string
  amount?: string
  currency?: string
  categoryId?: string
  transactionDate?: string
  merchant?: string
  description?: string
}

/** Builds the query the guided transaction form reads back. */
export function buildTransactionFormParams(
  input: TransactionFormParamsInput
): URLSearchParams {
  const params = new URLSearchParams({ type: input.type })
  const optionalValues: [string, string | undefined][] = [
    ["destination", input.destination],
    [PREFILL_QUERY_KEYS.amount, input.amount],
    [PREFILL_QUERY_KEYS.currency, input.currency],
    [PREFILL_QUERY_KEYS.categoryId, input.categoryId],
    [PREFILL_QUERY_KEYS.transactionDate, input.transactionDate],
    [PREFILL_QUERY_KEYS.merchant, input.merchant],
    [PREFILL_QUERY_KEYS.description, input.description],
  ]
  for (const [key, value] of optionalValues) {
    const trimmed = value?.trim()
    if (trimmed) {
      params.set(key, trimmed)
    }
  }
  return params
}
