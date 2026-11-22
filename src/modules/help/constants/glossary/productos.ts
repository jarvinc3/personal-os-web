import type { HelpTerm } from "@/src/modules/help/types/help.types"

export const PRODUCTOS_TERMS: readonly HelpTerm[] = [
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
]
