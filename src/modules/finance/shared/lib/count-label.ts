/**
 * Nouns the app counts out loud. The pair lives here so a row never says
 * «1 cuentas» or «1/1 cuotas» because another count in the same row is plural.
 */
export const FINANCE_COUNT_NOUNS = {
  account: { singular: "cuenta", plural: "cuentas" },
  card: { singular: "tarjeta", plural: "tarjetas" },
  loan: { singular: "préstamo", plural: "préstamos" },
  installment: { singular: "cuota", plural: "cuotas" },
} as const

export type FinanceCountNoun = keyof typeof FINANCE_COUNT_NOUNS

/** `1 cuenta` / `2 cuentas`: the count decides the word. */
export function countLabel(count: number, noun: FinanceCountNoun): string {
  const { singular, plural } = FINANCE_COUNT_NOUNS[noun]
  return `${count} ${count === 1 ? singular : plural}`
}
