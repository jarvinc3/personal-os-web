import type { HelpFaqGroup } from "@/src/modules/help/types/help.types"

export const HELP_FAQ_GROUPS: readonly HelpFaqGroup[] = [
  {
    slug: "cuenta",
    title: "Cuenta",
    questions: [
      {
        id: "crear-cuenta",
        question: "¿Cómo creo mi cuenta?",
        answer:
          "Desde la pantalla de entrada elige Regístrate, o entra con Google. Si usas correo, abre el mensaje de verificación antes de iniciar sesión. Si es tu primera vez, la guía [[Primeros pasos|guia:primeros-pasos]] sigue el orden completo.",
      },
      {
        id: "cambiar-correo",
        question: "¿Puedo cambiar el correo con el que entro?",
        answer:
          "No desde la app: el correo de acceso solo se lee en Perfil y cuenta. El nombre y la foto sí se editan ahí.",
      },
      {
        id: "cerrar-sesion",
        question: "¿Qué pasa si cierro sesión?",
        answer:
          "Puedes volver a entrar con el mismo correo o con Google. Tus datos quedan en tu cuenta, no en el dispositivo.",
      },
      {
        id: "varios-dispositivos",
        question:
          "¿Puedo usar la misma cuenta en el teléfono y en la computadora?",
        answer:
          "Sí. Entra con la misma cuenta. Los datos se guardan en el servidor y se ven igual en los dos.",
      },
    ],
  },
  {
    slug: "finanzas",
    title: "Finanzas",
    questions: [
      {
        id: "patrimonio-incompleto",
        question: "¿Por qué el patrimonio dice incompleto?",
        answer:
          "Falta el [[límite de crédito|limite-de-credito]] de una tarjeta o la [[tasa de cambio|tasa-de-cambio]] de una moneda. Complétalos y el total se calcula.",
      },
      {
        id: "saldo-descuadrado",
        question: "¿Por qué aparece un saldo descuadrado?",
        answer:
          "El [[saldo|saldo]] guardado no coincide con la suma de los movimientos confirmados. Abre el producto y toca Recalcular; no se crea ningún [[movimiento|movimiento]].",
      },
      {
        id: "gasto-sin-banco",
        question: "¿Puedo registrar un gasto sin banco?",
        answer:
          "Sí. Usa una cuenta de [[efectivo|efectivo]], que ya viene creada por moneda. El gasto baja ese saldo igual que una cuenta normal.",
      },
      {
        id: "corregir-movimiento",
        question: "¿Cómo corrijo un movimiento equivocado?",
        answer:
          "Si está pendiente, edítalo. Si está completado, desbloquéalo, corrígelo y vuelve a confirmarlo. Si lo borras, puedes deshacer o restaurarlo desde la [[papelera|papelera]].",
      },
      {
        id: "cobro-en-patrimonio",
        question: "¿Por qué un cobro no aparece en el patrimonio?",
        answer:
          "Los cobros vencidos hace más de 90 días pasan a [[dudosos|dudosos]] y no suman. Los pendientes recientes sí suman al [[por cobrar|por-cobrar]].",
      },
    ],
  },
  {
    slug: "notificaciones",
    title: "Notificaciones",
    questions: [
      {
        id: "sin-avisos",
        question: "¿Por qué no me llegan los avisos?",
        answer:
          "Revisa que Push esté encendido, que el navegador o el sistema tenga permiso y que el horario silencioso no esté activo. En iPhone, abre la app instalada en la pantalla de inicio. La guía [[Notificaciones y avisos|guia:notificaciones]] repasa los pasos.",
      },
      {
        id: "silencio-nocturno",
        question: "¿Cómo silencio las notificaciones de noche?",
        answer:
          "En Ajustes → Notificaciones activa el horario silencioso y elige el rango. Dentro de ese horario los avisos se pausan.",
      },
      {
        id: "elegir-avisos",
        question: "¿Puedo elegir qué avisos recibo?",
        answer:
          "Sí. En Ajustes → Apps → Finanzas hay grupos para movimientos, reportes, tarjetas, cobros y suscripciones, e IA y saldos.",
      },
      {
        id: "avisos-por-correo",
        question: "¿Los avisos llegan por correo?",
        answer:
          "Solo si activas el canal Email en Ajustes → Notificaciones. Push e In-app se activan por separado.",
      },
    ],
  },
  {
    slug: "privacidad",
    title: "Privacidad",
    questions: [
      {
        id: "vaciar-todo",
        question: "¿Qué borra «Vaciar todos los datos»?",
        answer:
          "En Ajustes › Privacidad › Vaciar todos los datos ves las ramas de cada app con lo que hay en cada una. Marcas las que quieras; al marcar una se vacían también las que dependen de ella, con su conteo a la vista. La cuenta sigue existiendo y lo vaciado no se puede recuperar.",
      },
      {
        id: "vaciar-finanzas",
        question: "¿Puedo vaciar solo Finanzas?",
        answer:
          "Sí. En Ajustes › Apps › Finanzas, al final, Vaciar datos de Finanzas lista sus ramas —movimientos y saldos, productos, planificación, y comercios y categorías— con su conteo y lo que arrastra cada una. Eliges, confirmas con tu contraseña o tu cuenta de Google y no toca las demás apps. El correo importado se vacía desde Inteligencia.",
      },
      {
        id: "recuperar-vaciado",
        question: "¿Puedo recuperar lo que vacié?",
        answer:
          "No. El vaciado es definitivo. En cambio, un movimiento, una transferencia o un presupuesto borrado va a la [[papelera|papelera]] y se puede restaurar.",
      },
      {
        id: "eliminar-cuenta",
        question: "¿Qué pasa si elimino mi cuenta?",
        answer:
          "Se borran el perfil, las preferencias, los datos financieros y los tokens push. La app pide tu contraseña o tu cuenta de Google antes de continuar.",
      },
    ],
  },
]
