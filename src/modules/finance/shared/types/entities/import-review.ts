/** Un import de correo que espera una decisión humana (back: `fin_signal_import`). */
export type ImportReviewItemPayload = {
  id: string
  signalId: string
  sourceEmailMessageId: string
  reviewReason: string | null
  /** JSON del candidato tal como lo guardó la señal; se valida antes de pintarlo. */
  candidate: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/** Los campos del candidato que la cola usa. Lo que falta queda en null, no se inventa. */
export type ImportReviewCandidate = {
  amount: number | null
  currency: string | null
  transactionDate: string | null
  suggestedTransactionDate: string | null
  merchant: string | null
  bankReference: string | null
  movementClass: string | null
  last4: string | null
  accountNumberLast4: string | null
}

export type ImportReviewItem = Omit<ImportReviewItemPayload, "candidate"> & {
  candidate: ImportReviewCandidate
}
