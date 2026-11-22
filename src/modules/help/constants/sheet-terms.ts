/**
 * Qué términos del glosario explica cada hoja de Finanzas.
 *
 * Es la fuente de la decisión del header: una hoja con entrada aquí muestra
 * «?»; una hoja sin entrada conserva el icono del agente. Los slugs deben
 * existir en `HELP_TERMS`; `sheet-glossary.spec.ts` lo verifica.
 */
export const SHEET_GLOSSARY_TERMS = {
  "account-sheet": ["cuenta", "efectivo", "institucion", "saldo"],
  "account-balance-sheet": ["saldo", "descuadre", "ajuste-de-saldo"],
  "account-history-sheet": ["movimiento", "estado-de-movimiento", "saldo"],
  "account-reconciliation-sheet": ["conciliar", "saldo", "ajuste-de-saldo"],
  "card-balance-sheet": [
    "saldo",
    "limite-de-credito",
    "ajuste-de-saldo",
    "tasa-de-cambio",
  ],
  "card-history-sheet": ["movimiento", "estado-de-movimiento", "saldo"],
  "card-payment-sheet": ["tarjeta", "disponible", "saldo"],
  "card-reconciliation-sheet": ["conciliar", "saldo", "ajuste-de-saldo"],
  "card-statement-sheet": [
    "estado-de-cuenta",
    "limite-de-credito",
    "utilizacion",
    "saldo",
    "movimiento",
  ],
  "installment-detail-sheet": ["prestamo", "cuota", "principal", "interes"],
  "loan-amortization-sheet": ["prestamo", "cuota", "principal", "interes"],
  "loan-payment-sheet": ["prestamo", "cuota", "principal", "interes"],
  "loan-prepayment-sheet": ["prestamo", "principal", "interes"],
  "savings-sheet": ["meta-de-ahorro", "aporte", "apartado"],
  "savings-contribution-sheet": ["meta-de-ahorro", "aporte", "apartado"],
  "savings-withdrawal-sheet": ["meta-de-ahorro", "apartado", "saldo"],
  "receivable-sheet": ["por-cobrar", "cobro", "dudosos"],
  "receivable-payment-sheet": ["por-cobrar", "cobro"],
  "receivable-share-sheet": ["por-cobrar", "cobro"],
  "public-receivable-detail-sheet": ["por-cobrar", "cobro", "dudosos"],
  "subscription-sheet": ["suscripcion", "comercio", "movimiento"],
  "subscription-payment-sheet": ["suscripcion", "movimiento"],
  "subscription-upcoming-sheet": ["suscripcion", "comercio"],
  "subscription-alerts-sheet": ["suscripcion", "movimiento"],
  "subscription-detected-sheet": ["suscripcion", "comercio", "movimiento"],
  "budget-sheet": ["presupuesto", "categoria", "movimiento"],
  "category-sheet": ["categoria", "presupuesto", "movimiento"],
  "merchant-create-sheet": ["comercio", "categoria", "movimiento"],
  "merchant-edit-sheet": ["comercio", "categoria", "movimiento"],
  "balance-drifts-sheet": ["descuadre", "saldo", "conciliar"],
  "pending-reconciliations-sheet": ["conciliar", "sin-conciliar", "descuadre"],
  "statement-password-sheet": [
    "importar-estado-de-cuenta",
    "estado-de-cuenta",
    "conciliar",
  ],
  "quick-entry-preview-sheet": ["movimiento", "categoria", "comercio"],
} as const satisfies Record<string, readonly string[]>

export type SheetGlossaryKey = keyof typeof SHEET_GLOSSARY_TERMS
