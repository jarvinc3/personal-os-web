import type {
  HelpGuide,
  HelpGuideGroupId,
} from "@/src/modules/help/types/help.types"

export const HELP_GUIDE_GROUPS: readonly {
  id: HelpGuideGroupId
  title: string
  description: string
}[] = [
  {
    id: "instalacion",
    title: "Instalar la app",
    description: "Añádela a tu teléfono o escritorio y recibe avisos.",
  },
  {
    id: "primeros-pasos",
    title: "Primeros pasos",
    description: "De la cuenta nueva al primer movimiento.",
  },
  {
    id: "apps",
    title: "Guías de cada app",
    description: "Finanzas, conciliación, planificación y avisos.",
  },
]

export const HELP_GUIDES: readonly HelpGuide[] = [
  {
    slug: "instalar-android",
    title: "Instalar en Android",
    summary:
      "Añade Personal OS a la pantalla de inicio y úsala sin la barra del navegador.",
    group: "instalacion",
    steps: [
      {
        title: "Abre Personal OS en Chrome",
        body: "En Android, la instalación funciona desde Chrome. Si abriste el enlace en otro navegador, cámbialo a Chrome.",
      },
      {
        title: "Abre el menú del navegador",
        body: "Toca los tres puntos de la esquina superior derecha y elige «Instalar aplicación» o «Añadir a pantalla de inicio».",
      },
      {
        title: "Confirma el nombre",
        body: "Acepta. El icono de Personal OS queda en la pantalla de inicio y la app abre sin la barra del navegador.",
      },
      {
        title: "Activa los avisos",
        body: "Abre Ajustes → Notificaciones y enciende Push. Android pedirá permiso la primera vez.",
      },
      {
        title: "Si no ves la opción",
        body: "Comprueba que la página carga con candado (HTTPS) y que Chrome está actualizado.",
      },
    ],
  },
  {
    slug: "instalar-iphone",
    title: "Instalar en iPhone",
    summary:
      "Añádela desde Safari y activa los avisos push de la app instalada.",
    group: "instalacion",
    steps: [
      {
        title: "Abre Personal OS en Safari",
        body: "En el iPhone, la opción de instalar solo aparece en Safari. Si abriste el enlace en otro navegador, cópialo y pégalo en Safari.",
      },
      {
        title: "Toca Compartir",
        body: "Pulsa el icono de compartir: un cuadrado con una flecha hacia arriba.",
      },
      {
        title: "Añade a la pantalla de inicio",
        body: "Desliza y elige «Añadir a pantalla de inicio». Confirma el nombre y toca Añadir.",
      },
      {
        title: "Activa los avisos push",
        body: "Abre la app instalada, no la pestaña de Safari. Entra en Ajustes → Notificaciones y enciende Push. En iPhone, los avisos llegan solo desde la app añadida a la pantalla de inicio, con iOS 16.4 o posterior.",
      },
    ],
  },
  {
    slug: "instalar-escritorio",
    title: "Instalar en escritorio",
    summary: "Abre Personal OS en su propia ventana desde Chrome o Edge.",
    group: "instalacion",
    steps: [
      {
        title: "Abre la app en Chrome o Edge",
        body: "En el escritorio, la instalación está disponible en navegadores compatibles con apps web.",
      },
      {
        title: "Busca Instalar",
        body: "El icono aparece a la derecha de la barra de direcciones. También está en el menú del navegador como «Instalar Personal OS».",
      },
      {
        title: "Confirma",
        body: "Acepta el nombre. La app se abre en su propia ventana y queda en el menú de aplicaciones del sistema.",
      },
      {
        title: "Safari y Firefox",
        body: "Esos navegadores no instalan apps web en escritorio. Puedes usar Personal OS desde una pestaña normal.",
      },
    ],
  },
  {
    slug: "primeros-pasos",
    title: "Primeros pasos",
    summary: "De la cuenta nueva a tu primer movimiento registrado.",
    group: "primeros-pasos",
    steps: [
      {
        title: "Crea tu cuenta",
        body: "Regístrate con tu correo o entra con Google. Si usas correo, abre el mensaje de verificación antes de iniciar sesión.",
      },
      {
        title: "Completa tu perfil",
        body: "En Ajustes → Perfil y cuenta agrega tu nombre y tu foto.",
      },
      {
        title: "Elige tu región",
        body: "En Ajustes → Preferencias regionales ajusta la zona horaria, el idioma, la moneda y el primer día de la semana. Las fechas y los montos siguen esa elección.",
      },
      {
        title: "Activa tus apps",
        body: "En Ajustes → Apps enciende Finanzas, Agenda, Salud o Proyectos. Solo las apps activas aparecen en el menú.",
      },
      {
        title: "Crea una institución y una cuenta",
        body: "En Finanzas → Productos agrega el banco y la cuenta donde tienes el dinero. La institución de [[efectivo|efectivo]] ya viene creada.",
      },
      {
        title: "Registra tu primer movimiento",
        body: "Toca crear y elige Gasto o Ingreso. Completa categoría, monto, cuenta y fecha. Si te equivocas, edítalo antes de confirmarlo.",
      },
    ],
  },
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
  {
    slug: "notificaciones",
    title: "Notificaciones y avisos",
    summary: "Elige por dónde te enteras y silencia las horas que quieras.",
    group: "apps",
    steps: [
      {
        title: "Elige los canales",
        body: "En Ajustes → Notificaciones activa Push, Email o In-app según cómo quieras enterarte.",
      },
      {
        title: "Silencia la noche",
        body: "Activa el horario silencioso y elige el rango. Los avisos se pausan dentro de ese horario.",
      },
      {
        title: "Elige qué avisos de Finanzas",
        body: "En Ajustes → Apps → Finanzas revisa los grupos: movimientos, reportes, tarjetas, cobros y suscripciones, e IA y saldos.",
      },
      {
        title: "Si no llega el push",
        body: "Revisa el permiso del navegador o del sistema, que Push esté encendido y que el horario silencioso no esté activo. En iPhone, abre la app instalada.",
      },
    ],
  },
]
