import type { HelpGuide } from "@/src/modules/help/types/help.types"

export const PLANNING_GUIDES: readonly HelpGuide[] = [
  {
    slug: "presupuestos",
    title: "Presupuestos",
    summary: "Pon un tope a lo que gastas por categoría y recibe avisos.",
    group: "apps",
    steps: [
      {
        title: "Abre Planificación",
        body: "En Finanzas, pestaña Planificación, entra en Presupuestos.",
      },
      {
        title: "Crea el tope",
        body: "Elige una o varias [[categorías|categoria]], el monto y el periodo: mensual, quincenal o propio.",
      },
      {
        title: "Ajusta el aviso",
        body: "Define el porcentaje al que quieres que te avise. El mes financiero empieza el día que configuraste en Ajustes → Finanzas.",
      },
      {
        title: "Sigue el gasto",
        body: "La barra muestra lo gastado y lo que queda. Los movimientos confirmados se suman solos.",
      },
      {
        title: "Edita o elimina",
        body: "Puedes cambiar el monto o el periodo; lo ya gastado se recalcula. Si eliminas el presupuesto, el tope deja de aplicarse y tus movimientos se conservan.",
      },
    ],
  },
  {
    slug: "metas-de-ahorro",
    title: "Metas de ahorro",
    summary:
      "Aparta dinero para un objetivo sin perder de vista tu saldo libre.",
    group: "apps",
    steps: [
      {
        title: "Crea la meta",
        body: "En Finanzas → Planificación, pestaña Metas, define nombre, monto objetivo, fecha opcional y la cuenta de origen por defecto.",
      },
      {
        title: "Registra un aporte",
        body: "Cada [[aporte|aporte]] elige la cuenta de origen y crea un [[movimiento|movimiento]]. El saldo de la cuenta baja y la meta sube.",
      },
      {
        title: "Sigue el progreso",
        body: "La meta muestra el porcentaje, cuánto falta y, si te pasas del objetivo, el excedente.",
      },
      {
        title: "Corrige un aporte",
        body: "Borra el aporte desde su historial y el movimiento relacionado se revierte.",
      },
    ],
  },
  {
    slug: "prestamos",
    title: "Préstamos",
    summary: "Registra lo que debes, paga cuotas y abona a capital.",
    group: "apps",
    steps: [
      {
        title: "Crea el préstamo",
        body: "En Finanzas → Planificación, pestaña Préstamos, toca crear. El asistente calcula la [[cuota|cuota]] con el monto, la tasa y el número de cuotas.",
      },
      {
        title: "Revisa el plan",
        body: "Antes de guardar puedes ver la tabla de amortización: cuánto va a [[principal|principal]] y cuánto a [[interés|interes]] en cada cuota.",
      },
      {
        title: "Paga una cuota",
        body: "En el detalle toca pagar la cuota. Se registra el pago con su desglose.",
      },
      {
        title: "Abona a capital",
        body: "El abono a capital baja el [[principal|principal]] sin esperar al calendario y muestra el efecto en el plazo o en la cuota.",
      },
      {
        title: "Sigue el saldo",
        body: "El detalle muestra lo pagado, lo que falta y la siguiente fecha de pago.",
      },
    ],
  },
  {
    slug: "cobros",
    title: "Cobros",
    summary: "Anota lo que te deben, registra pagos y comparte el cobro.",
    group: "apps",
    steps: [
      {
        title: "Crea el cobro",
        body: "En Finanzas → Planificación, pestaña Cobros, agrega el deudor, el concepto y el monto.",
      },
      {
        title: "Registra un pago",
        body: "Puede ser total o parcial. El estado cambia a parcial o pagado y el [[por cobrar|por-cobrar]] baja.",
      },
      {
        title: "Comparte el cobro",
        body: "Desde el detalle puedes crear un enlace de solo lectura o mandarlo por WhatsApp. Quien lo abra no entra a tu cuenta.",
      },
      {
        title: "Cancela si no se va a cobrar",
        body: "Un [[cobro|cobro]] no se borra: se cancela. Deja de sumar al [[patrimonio|patrimonio]] y conserva el historial.",
      },
    ],
  },
]
