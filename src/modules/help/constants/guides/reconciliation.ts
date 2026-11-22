import type { HelpGuide } from "@/src/modules/help/types/help.types"

export const RECONCILIATION_GUIDES: readonly HelpGuide[] = [
  {
    slug: "conciliar-una-cuenta",
    title: "Conciliar una cuenta",
    summary: "Cuadra el saldo de la app con el del banco a fin de mes.",
    group: "apps",
    steps: [
      {
        title: "Abre el producto",
        body: "En Finanzas → Productos entra en la cuenta o en la tarjeta. Las tarjetas de débito se concilian desde su cuenta, que es donde vive el saldo.",
      },
      {
        title: "Toca Conciliar",
        body: "Escribe el saldo real que ves en la app del banco y la fecha del corte. La pantalla muestra la diferencia con el saldo de la app.",
      },
      {
        title: "Revisa las líneas",
        body: "La app propone un impuesto y el resto como otro cargo. Ajusta el tipo y el monto de cada línea hasta que sumen exactamente la diferencia.",
      },
      {
        title: "Confirma",
        body: "Se crean [[ajustes de saldo|ajuste-de-saldo]] por cada línea. Mueven el saldo, pero no cuentan como gasto ni entran en presupuestos.",
      },
      {
        title: "Corrige si hace falta",
        body: "Borra la conciliación desde su historial. El último cierre se revierte y los ajustes se pueden restaurar desde la [[papelera|papelera]].",
      },
    ],
  },
  {
    slug: "importar-un-estado-de-cuenta",
    title: "Importar un estado de cuenta",
    summary:
      "Sube el PDF del banco y revisa qué movimientos coinciden con la app.",
    group: "apps",
    steps: [
      {
        title: "Ten el PDF a mano",
        body: "El archivo lo da el banco. No puede pasar de 10 MB.",
      },
      {
        title: "Inicia la importación",
        body: "En el detalle de la tarjeta o de la cuenta bancaria toca Importar estado de cuenta y elige el PDF. Si tiene contraseña, la app la pide y no la guarda.",
      },
      {
        title: "Espera el análisis",
        body: "Finanzas lee el periodo, los saldos, el mínimo, la fecha límite y los movimientos.",
      },
      {
        title: "Revisa los tres grupos",
        body: "Coinciden, faltan en la app y sobran en la app. Marca lo que quieres crear o ignorar.",
      },
      {
        title: "Aplica",
        body: "Se crean los movimientos marcados y se cierra el corte. Si lo pides, también se registra un [[ajuste de saldo|ajuste-de-saldo]] por la diferencia.",
      },
    ],
  },
]
