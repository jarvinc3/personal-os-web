import type { HelpTerm } from "@/src/modules/help/types/help.types"

export const PLANIFICACION_TERMS: readonly HelpTerm[] = [
  {
    slug: "presupuesto",
    term: "Presupuesto",
    category: "planificacion",
    definition:
      "Un tope de gasto para una o varias [[categorías|categoria]] en un periodo. Finanzas compara lo gastado con el tope y te avisa cuando te acercas.",
    related: ["categoria", "movimiento"],
  },
  {
    slug: "meta-de-ahorro",
    term: "Meta de ahorro",
    category: "planificacion",
    definition:
      "Un objetivo de dinero, con fecha opcional, ligado a una [[cuenta|cuenta]]. Lo que apartas se registra como [[aporte|aporte]].",
    aliases: ["meta", "ahorro"],
    related: ["aporte", "cuenta"],
  },
  {
    slug: "aporte",
    term: "Aporte",
    category: "planificacion",
    definition:
      "El dinero que apartas para una [[meta de ahorro|meta-de-ahorro]]. Sale de una cuenta y crea un [[movimiento|movimiento]]; si lo borras, el movimiento se revierte.",
    aliases: ["contribución"],
    related: ["meta-de-ahorro", "movimiento"],
  },
  {
    slug: "apartado",
    term: "Apartado",
    category: "planificacion",
    definition:
      "El dinero de una [[cuenta|cuenta]] reservado para una [[meta de ahorro|meta-de-ahorro]]. Sigue dentro del [[saldo|saldo]] de la cuenta: solo sale cuando lo retiras o lo gastas.",
    aliases: ["reservado", "earmarked"],
    related: ["meta-de-ahorro", "aporte", "saldo"],
  },
  {
    slug: "prestamo",
    term: "Préstamo",
    category: "planificacion",
    definition:
      "Dinero que te prestaron y debes devolver. Tiene monto, tasa, número de [[cuotas|cuota]] y un saldo pendiente.",
    related: ["cuota", "principal", "interes"],
  },
  {
    slug: "cuota",
    term: "Cuota",
    category: "planificacion",
    definition:
      "Cada pago programado de un [[préstamo|prestamo]]. Una parte paga [[interés|interes]] y el resto baja el [[principal|principal]].",
    aliases: ["instalment", "pago mensual"],
    related: ["prestamo", "principal", "interes"],
  },
  {
    slug: "principal",
    term: "Principal",
    category: "planificacion",
    definition:
      "La parte del [[préstamo|prestamo]] que todavía es capital, sin contar intereses. Es lo que baja cuando pagas una [[cuota|cuota]] o haces un abono a capital.",
    aliases: ["capital"],
    related: ["prestamo", "cuota", "interes"],
  },
  {
    slug: "interes",
    term: "Interés",
    category: "planificacion",
    definition:
      "Lo que cuesta el dinero prestado. En un [[préstamo|prestamo]] se calcula sobre el [[principal|principal]] pendiente; en una tarjeta, sobre el saldo que no pagas al corte.",
    aliases: ["tasa de interés"],
    related: ["prestamo", "cuota", "principal"],
  },
  {
    slug: "cobro",
    term: "Cobro",
    category: "planificacion",
    definition:
      "Dinero que te deben. Tiene deudor, monto y pagos parciales; no se borra, se cancela. Mientras esté pendiente suma al [[por cobrar|por-cobrar]].",
    aliases: ["cuenta por cobrar", "receivable"],
    related: ["por-cobrar", "dudosos"],
  },
]
