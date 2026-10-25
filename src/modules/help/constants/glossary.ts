import type {
  HelpTerm,
  HelpTermCategoryId,
} from "@/src/modules/help/types/help.types"

export const HELP_TERM_CATEGORIES: readonly {
  id: HelpTermCategoryId
  label: string
}[] = [
  { id: "general", label: "La app" },
  { id: "dinero", label: "Dinero y patrimonio" },
  { id: "productos", label: "Cuentas, tarjetas y productos" },
  { id: "movimientos", label: "Movimientos" },
  { id: "planificacion", label: "Planificación" },
  { id: "correo", label: "Correo y banco" },
]

export const HELP_TERMS: readonly HelpTerm[] = [
  {
    slug: "app",
    term: "App",
    category: "general",
    definition:
      "Cada área de Personal OS que activas y usas: Finanzas, Agenda, Salud y Proyectos. Se encienden y apagan por separado en Ajustes → Apps; una app apagada no aparece en el menú.",
    aliases: ["aplicación", "módulo"],
  },
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
  {
    slug: "cuenta",
    term: "Cuenta",
    category: "productos",
    definition:
      "Donde vive tu dinero en una [[institución|institucion]]: cuenta corriente, de ahorro o de inversión. El [[efectivo|efectivo]] también es una cuenta.",
    related: ["institucion", "efectivo", "tarjeta"],
  },
  {
    slug: "efectivo",
    term: "Efectivo",
    category: "productos",
    definition:
      "El dinero en mano. Finanzas le da su propia institución y una cuenta por moneda, para que registres gastos sin banco.",
    aliases: ["cash"],
    related: ["cuenta", "institucion"],
  },
  {
    slug: "institucion",
    term: "Institución",
    category: "productos",
    definition:
      "El banco, cooperativa, billetera, casa de bolsa o el efectivo donde están tus cuentas y tarjetas.",
    aliases: ["banco"],
    related: ["cuenta", "tarjeta"],
  },
  {
    slug: "tarjeta",
    term: "Tarjeta",
    category: "productos",
    definition:
      "El instrumento con el que pagas. La de crédito tiene [[límite|limite-de-credito]], corte y pago; la de débito gasta el saldo de su [[cuenta|cuenta]].",
    related: ["limite-de-credito", "estado-de-cuenta"],
  },
  {
    slug: "limite-de-credito",
    term: "Límite de crédito",
    category: "productos",
    definition:
      "El máximo que el banco te deja deber en una tarjeta de crédito. Sin límite, Finanzas no puede calcular el disponible de esa tarjeta y el [[patrimonio|patrimonio]] queda incompleto.",
    aliases: ["límite"],
    related: ["tarjeta", "utilizacion", "patrimonio"],
  },
  {
    slug: "utilizacion",
    term: "Utilización",
    category: "productos",
    definition:
      "La parte del [[límite de crédito|limite-de-credito]] que ya usaste. Si el saldo supera el límite, la utilización pasa del 100 % y conviene revisar los cargos.",
    aliases: ["uso de la tarjeta"],
    related: ["tarjeta", "limite-de-credito"],
  },
  {
    slug: "estado-de-cuenta",
    term: "Estado de cuenta",
    category: "productos",
    definition:
      "El corte de una tarjeta: periodo, saldo al corte, pago mínimo y fecha límite. Finanzas lo cierra solo, o lo cargas a mano o desde el PDF del banco.",
    aliases: ["corte", "statement"],
    related: ["tarjeta", "importar-estado-de-cuenta"],
  },
  {
    slug: "categoria",
    term: "Categoría",
    category: "productos",
    definition:
      "Cómo clasificas un gasto o un ingreso. Puede tener subcategorías y se usa en [[presupuestos|presupuesto]] y en las estadísticas.",
    related: ["movimiento", "presupuesto"],
  },
  {
    slug: "comercio",
    term: "Comercio",
    category: "productos",
    definition:
      "El negocio donde hiciste un gasto. Finanzas agrupa las variantes del mismo nombre para que el historial y los reportes por comercio no se dispersen.",
    aliases: ["merchant", "establecimiento"],
    related: ["movimiento"],
  },
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
  {
    slug: "importar-estado-de-cuenta",
    term: "Importar estado de cuenta",
    category: "correo",
    definition:
      "Subir el PDF que da el banco para leer el corte y sus movimientos, y compararlos con lo que ya tienes en la app. La revisión se llama conciliación del import.",
    aliases: ["importación", "PDF del banco"],
    related: ["estado-de-cuenta", "conciliar"],
  },
]
