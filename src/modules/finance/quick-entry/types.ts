export type QuickEntryDraft = {
  type: "DEBIT" | "CREDIT"
  amount: string
  currency: string
  categoryId: string | null
  accountId: string | null
  cardId: string | null
  date: string
  merchant: string | null
  description: string | null
}

export type QuickEntryParseResult = {
  draft: QuickEntryDraft
  confidence: number
  missing: string[]
}
