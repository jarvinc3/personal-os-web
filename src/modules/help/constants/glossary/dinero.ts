import type { HelpTerm } from "@/src/modules/help/types/help.types"

export const DINERO_TERMS: readonly HelpTerm[] = [
  {
    slug: "patrimonio",
    term: "Patrimonio neto",
    category: "dinero",
    definition:
      "Lo que tienes menos lo que debes, en la [[moneda base|moneda-base]]. Suma el [[disponible|disponible]] y el [[por cobrar|por-cobrar]], y resta las deudas de tarjetas y préstamos. Si falta un límite o una tasa, el total queda incompleto.",
    aliases: ["patrimonio", "net worth"],
    related: ["disponible", "por-cobrar", "balance-general"],
  },
  {
    slug: "disponible",
    term: "Disponible",
    category: "dinero",
    definition:
      "En el [[patrimonio|patrimonio]], el dinero líquido: saldos de cuentas y de efectivo, sin tarjetas ni cobros. En una tarjeta de crédito, «Disponible» es otra cosa: el crédito que te queda.",
    related: ["patrimonio", "limite-de-credito"],
  },
  {
    slug: "por-cobrar",
    term: "Por cobrar",
    category: "dinero",
    definition:
      "Dinero que te deben y todavía no has cobrado. Suma al [[patrimonio|patrimonio]] mientras el [[cobro|cobro]] esté pendiente y no haya pasado a [[dudosos|dudosos]].",
    related: ["cobro", "dudosos"],
  },
  {
    slug: "dudosos",
    term: "Dudosos",
    category: "dinero",
    definition:
      "Cobros vencidos hace más de 90 días. Se muestran aparte y no suman al [[patrimonio|patrimonio]] porque es poco probable cobrarlos.",
    related: ["por-cobrar", "cobro"],
  },
  {
    slug: "activo",
    term: "Activo",
    category: "dinero",
    definition:
      "Lo que tienes: cuentas, efectivo y dinero por cobrar. En el [[balance general|balance-general]] aparece separado de las deudas.",
    aliases: ["activos"],
    related: ["deuda", "balance-general"],
  },
  {
    slug: "deuda",
    term: "Deuda",
    category: "dinero",
    definition:
      "Lo que debes: el saldo de tus tarjetas de crédito y lo que queda de tus préstamos. En el [[balance general|balance-general]] aparece como pasivo.",
    aliases: ["pasivo", "pasivos"],
    related: ["activo", "balance-general"],
  },
  {
    slug: "balance-general",
    term: "Balance general",
    category: "dinero",
    definition:
      "La foto de tus [[activos|activo]] y [[deudas|deuda]] en una fecha, en la [[moneda base|moneda-base]]. De ahí sale el [[patrimonio neto|patrimonio]].",
    aliases: ["balance sheet", "balance"],
    related: ["patrimonio", "activo", "deuda"],
  },
  {
    slug: "moneda-base",
    term: "Moneda base",
    category: "dinero",
    definition:
      "La moneda con la que Finanzas suma y compara todo. Cada saldo y movimiento se convierte a ella con la [[tasa de cambio|tasa-de-cambio]] del día.",
    aliases: ["baseCurrency"],
    related: ["tasa-de-cambio"],
  },
  {
    slug: "tasa-de-cambio",
    term: "Tasa de cambio",
    category: "dinero",
    definition:
      "Cuánto vale una moneda en otra. Finanzas la usa para convertir un monto a la [[moneda base|moneda-base]]; si falta la tasa, el total queda incompleto.",
    aliases: ["tipo de cambio", "FX"],
    related: ["moneda-base"],
  },
  {
    slug: "flujo-de-caja",
    term: "Flujo de caja",
    category: "dinero",
    definition:
      "Lo que entra menos lo que sale en un periodo. No es el [[patrimonio|patrimonio]]: mover dinero entre tus cuentas no cambia lo que tienes.",
    aliases: ["cash flow"],
    related: ["patrimonio"],
  },
  {
    slug: "saldo",
    term: "Saldo",
    category: "dinero",
    definition:
      "El dinero que hay en una cuenta, tarjeta o meta en un momento dado. En una cuenta es lo que tienes; en una tarjeta de crédito es lo que debes.",
    related: ["movimiento", "descuadre"],
  },
  {
    slug: "descuadre",
    term: "Descuadre",
    category: "dinero",
    definition:
      "El [[saldo|saldo]] guardado de una cuenta o tarjeta no coincide con la suma de sus movimientos confirmados. Se corrige con Recalcular, que ajusta el saldo sin inventar un movimiento. No es una [[conciliación|conciliar]] contra el banco.",
    aliases: ["descuadrado", "integridad"],
    related: ["saldo", "conciliar"],
  },
  {
    slug: "conciliar",
    term: "Conciliar",
    category: "dinero",
    definition:
      "Comparar el saldo de la app con el que muestra el banco y registrar la diferencia como cargos o ajustes. Se hace a fin de mes y no cambia el historial de movimientos.",
    aliases: ["conciliación", "reconciliación"],
    related: ["ajuste-de-saldo", "descuadre"],
  },
  {
    slug: "sin-conciliar",
    term: "Sin conciliar",
    category: "dinero",
    definition:
      "Un producto con saldo distinto de cero cuyo saldo todavía no comparaste con el banco este mes. Se concilia a fin de mes; mientras tanto aparece en «Sin conciliar» y no cambia ningún saldo.",
    related: ["conciliar", "saldo"],
  },
]
