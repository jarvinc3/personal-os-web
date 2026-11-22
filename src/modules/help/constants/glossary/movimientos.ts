import type { HelpTerm } from "@/src/modules/help/types/help.types"

export const MOVIMIENTOS_TERMS: readonly HelpTerm[] = [
  {
    slug: "movimiento",
    term: "Movimiento",
    category: "movimientos",
    definition:
      "Cada gasto, ingreso, transferencia o ajuste que cambia un [[saldo|saldo]]. Tiene fecha, monto, moneda y, si aplica, [[categoría|categoria]].",
    aliases: ["transacción", "transaction"],
    related: ["transferencia", "ajuste-de-saldo", "estado-de-movimiento"],
  },
  {
    slug: "transferencia",
    term: "Transferencia",
    category: "movimientos",
    definition:
      "Mover dinero entre dos cuentas tuyas. Se registra como dos patas con el mismo grupo; no es un gasto y no lleva [[categoría|categoria]].",
    related: ["movimiento", "cuenta"],
  },
  {
    slug: "ajuste-de-saldo",
    term: "Ajuste de saldo",
    category: "movimientos",
    definition:
      "Un movimiento que corrige el [[saldo|saldo]] de una cuenta sin ser gasto ni ingreso. Aparece en el historial, pero no cuenta en [[presupuestos|presupuesto]] ni en el tablero.",
    aliases: ["adjustment"],
    related: ["movimiento", "conciliar"],
  },
  {
    slug: "estado-de-movimiento",
    term: "Estado del movimiento",
    category: "movimientos",
    definition:
      "Pendiente, completado, revertido o cancelado. Un movimiento completado está bloqueado: para editarlo hay que desbloquearlo primero.",
    related: ["movimiento", "papelera"],
  },
  {
    slug: "suscripcion",
    term: "Suscripción",
    category: "movimientos",
    definition:
      "Un cobro que se repite, como un servicio mensual. Finanzas detecta los cargos recurrentes y te avisa antes de que vuelvan a cobrarte.",
    aliases: ["recurrente", "cargo recurrente"],
    related: ["movimiento", "comercio"],
  },
  {
    slug: "papelera",
    term: "Papelera",
    category: "movimientos",
    definition:
      "Donde quedan los registros borrados antes de desaparecer. Puedes restaurarlos desde ahí; un [[movimiento|movimiento]] recupera su efecto en el saldo.",
    aliases: ["reciclaje", "recycle bin"],
    related: ["movimiento"],
  },
]
