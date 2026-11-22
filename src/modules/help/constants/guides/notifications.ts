import type { HelpGuide } from "@/src/modules/help/types/help.types"

export const NOTIFICATIONS_GUIDES: readonly HelpGuide[] = [
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
