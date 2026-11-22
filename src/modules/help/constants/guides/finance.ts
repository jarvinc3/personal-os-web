import type { HelpGuide } from "@/src/modules/help/types/help.types"

export const FINANCE_GUIDES: readonly HelpGuide[] = [
  {
    slug: "tarjetas-de-credito",
    title: "Tarjetas de crédito",
    summary: "Controla el límite, el corte y el pago de cada tarjeta.",
    group: "apps",
    steps: [
      {
        title: "Crea la tarjeta",
        body: "En Finanzas → Productos agrega la tarjeta dentro de su institución. Necesita el [[límite|limite-de-credito]] para calcular el disponible.",
      },
      {
        title: "Revisa el corte",
        body: "El detalle muestra el saldo, la utilización, el próximo corte y la fecha de pago.",
      },
      {
        title: "Paga la tarjeta",
        body: "Toca pagar y elige la cuenta de origen. El pago baja el saldo de la tarjeta y el de la cuenta.",
      },
      {
        title: "Cierra el corte",
        body: "Finanzas cierra los ciclos vencidos por su cuenta. También puedes cargar el corte a mano con los datos del banco.",
      },
      {
        title: "Importa el PDF",
        body: "Si el banco te da el estado de cuenta en PDF, sigue la guía [[Importar un estado de cuenta|guia:importar-un-estado-de-cuenta]].",
      },
    ],
  },
  {
    slug: "suscripciones",
    title: "Suscripciones",
    summary: "Revisa los cobros repetidos y lo que se cobrará pronto.",
    group: "apps",
    steps: [
      {
        title: "Abre Suscripciones",
        body: "En Finanzas, pestaña Suscripciones. Arriba ves el costo mensual y el anual.",
      },
      {
        title: "Revisa lo detectado",
        body: "Finanzas propone [[suscripciones|suscripcion]] a partir de cargos repetidos del mismo [[comercio|comercio]]. Confírmalas o descártalas.",
      },
      {
        title: "Mira los próximos cobros",
        body: "El botón Próximos lista lo que se va a cobrar en los siguientes días.",
      },
      {
        title: "Registra el pago",
        body: "Cuando llegue el cobro, márcalo como pagado. El historial queda en la suscripción.",
      },
    ],
  },
]
