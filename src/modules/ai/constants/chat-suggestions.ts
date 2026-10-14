import type { ModuleChatSlug } from "@/src/modules/ai/types/chat.types"

export type ChatSuggestion = {
  id: string
  label: string
  prompt: string
}

const GENERAL_SUGGESTIONS: ChatSuggestion[] = [
  {
    id: "theme-dark",
    label: "Tema oscuro",
    prompt: "Cambia el tema de la app a modo oscuro.",
  },
  {
    id: "theme-light",
    label: "Tema claro",
    prompt: "Cambia el tema de la app a modo claro.",
  },
  {
    id: "notifications-email",
    label: "Email activado",
    prompt: "Activa las notificaciones por email en mis preferencias.",
  },
  {
    id: "user-context",
    label: "Mi configuración",
    prompt:
      "Muéstrame mi contexto actual: preferencias, tema y módulos activos.",
  },
  {
    id: "user-profile",
    label: "Mi perfil",
    prompt: "Muéstrame mi perfil: nombre, email, avatar y zona horaria.",
  },
  {
    id: "ai-tone",
    label: "Tono conciso",
    prompt: "Configura el tono del asistente en conciso.",
  },
  {
    id: "ai-no-confirm",
    label: "Sin confirmación",
    prompt: "Desactiva la confirmación antes de ejecutar acciones.",
  },
]

const MODULE_SUGGESTIONS: Record<
  Exclude<ModuleChatSlug, "general">,
  ChatSuggestion[]
> = {
  agenda: [
    {
      id: "agenda-reminders",
      label: "Recordatorios de eventos",
      prompt:
        "Activa los recordatorios de eventos en la configuración de Agenda.",
    },
    {
      id: "agenda-daily",
      label: "Agenda diaria",
      prompt: "Activa la notificación de agenda diaria en Agenda.",
    },
    {
      id: "agenda-push",
      label: "Push en agenda",
      prompt: "Activa las notificaciones push para el módulo de Agenda.",
    },
  ],
  projects: [
    {
      id: "projects-due",
      label: "Recordar vencimientos",
      prompt: "Activa los recordatorios de fechas de vencimiento en Proyectos.",
    },
    {
      id: "projects-status",
      label: "Cambios de estado",
      prompt:
        "Activa las notificaciones cuando cambie el estado de un proyecto.",
    },
  ],
  health: [
    {
      id: "health-goals",
      label: "Metas de salud",
      prompt: "Activa los recordatorios de metas en el módulo de Salud.",
    },
    {
      id: "health-weekly",
      label: "Resumen semanal",
      prompt: "Activa el resumen semanal de salud.",
    },
  ],
  finance: [
    {
      id: "finance-summary",
      label: "Resumen financiero",
      prompt:
        "Muéstrame un resumen de mis finanzas: patrimonio neto y flujo de caja del mes.",
    },
    {
      id: "finance-spending",
      label: "Gastos por categoría",
      prompt: "¿En qué categorías gasté más este mes?",
    },
    {
      id: "finance-budgets",
      label: "Estado de presupuestos",
      prompt:
        "Revisa el estado de mis presupuestos y si estoy cerca del límite.",
    },
    {
      id: "finance-transactions",
      label: "Últimas transacciones",
      prompt: "Lista mis transacciones más recientes.",
    },
    {
      id: "finance-subscription-renewals",
      label: "Renovaciones",
      prompt: "Activa las alertas de renovación de suscripciones.",
    },
  ],
}

export function getChatSuggestionsForModule(
  moduleSlug: ModuleChatSlug
): ChatSuggestion[] {
  if (moduleSlug === "general") {
    return GENERAL_SUGGESTIONS
  }

  const shared: ChatSuggestion[] = [
    {
      id: "module-context",
      label: "Ver mi contexto",
      prompt: `Muéstrame mi configuración actual relacionada con ${moduleSlug}.`,
    },
  ]

  return [...MODULE_SUGGESTIONS[moduleSlug], ...shared]
}
