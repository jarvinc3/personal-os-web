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

/** Reads the values the quick-entry sheet preloads into the guided form. */
export function parseTransactionPrefill(
  params: URLSearchParams
): TransactionPrefill {
  return {
    amount: readParam(params, "amount"),
    currency: readParam(params, "currency").toUpperCase(),
    categoryId: readParam(params, "categoryId"),
    transactionDate: readParam(params, "date"),
    merchant: readParam(params, "merchant"),
    description: readParam(params, "description"),
  }
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
    ["amount", input.amount],
    ["currency", input.currency],
    ["categoryId", input.categoryId],
    ["date", input.transactionDate],
    ["merchant", input.merchant],
    ["description", input.description],
  ]
  for (const [key, value] of optionalValues) {
    const trimmed = value?.trim()
    if (trimmed) {
      params.set(key, trimmed)
    }
  }
  return params
}
